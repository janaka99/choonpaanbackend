import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { isLoggedIn, isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subMonths } from "date-fns";
import { calculateTotalSales } from "@/utils/calculateTotalSales";

export async function GET(
  req: NextApiRequest,
  { params }: { params: Promise<{ userid: string }> }
) {
  const { userid } = await params;
  if (!userid) {
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
  const user = await isMangerLoggedInWithBakery(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const todayStart = startOfDay(new Date());
    const twelveMonthsAgo = subMonths(todayStart, 12);
    const twoYearsAgo = subMonths(todayStart, 24);

    const sales = await prisma.order.findMany({
      where: {
        seller: Number(userid),
        bakeryId: user.bakery.id,
        createdAt: {
          gte: twelveMonthsAgo,
          lt: todayStart,
        },
      },
    });

    const twoYearsAgoSales = await prisma.order.findMany({
      where: {
        seller: Number(userid),
        bakeryId: user.bakery.id,
        createdAt: {
          gte: twoYearsAgo,
          lt: twelveMonthsAgo,
        },
      },
    });

    function getLast12Months() {
      const today = new Date();
      const last12Months = [];

      for (let i = 1; i <= 12; i++) {
        const monthStart = subMonths(today, i);
        const label = monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        last12Months.push({
          date: monthStart.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
          }),
          label: label,
          value: 0,
        });
      }

      return last12Months;
    }

    let last12Months = getLast12Months();
    console.log(last12Months);

    let salesArray = [...sales];
    last12Months.forEach((month: any) => {
      let i = 0;
      while (i < salesArray.length) {
        const sale = salesArray[i];
        const saleMonth = sale.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
        });

        if (saleMonth === month.date) {
          month.value += Number(sale.sold) * Number(sale.price);
          salesArray.splice(i, 1); // Remove the sale from the array after it's used
        } else {
          i++; // Only increment if no sale is removed
        }
      }
    });

    const last12months = calculateTotalSales(sales);
    const lasttwoYears = calculateTotalSales(twoYearsAgoSales);

    let differencePercentage = 0;
    if (lasttwoYears > 0) {
      differencePercentage =
        ((last12months - lasttwoYears) / lasttwoYears) * 100;
    } else if (last12months > 0) {
      differencePercentage = 100; // If no sales in the previous week, treat it as a 100% increase
    }

    return NextResponse.json(
      {
        error: false,
        message: "",
        sales: last12Months,
        differencePercentage: JSON.stringify(
          parseFloat(differencePercentage.toFixed(2))
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
