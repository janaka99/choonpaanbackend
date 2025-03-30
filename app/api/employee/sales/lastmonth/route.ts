import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
import { calculateTotalSales } from "@/utils/calculateTotalSales";

export async function GET(req: NextRequest, res: NextApiResponse) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const todayStart = startOfDay(new Date());
    const thirtyDaysAgo = subDays(todayStart, 30);
    const prevthirtyDaysAgo = subDays(todayStart, 60);

    const sales = await prisma.order.findMany({
      where: {
        seller: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
          lt: todayStart,
        },
      },
    });

    const prevthirtyDaysAgoSales = await prisma.order.findMany({
      where: {
        seller: user.id,
        createdAt: {
          gte: prevthirtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });

    function getLast30Days() {
      const today = new Date();
      const last30Days = [];

      for (let i = 1; i < 30; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const label = day.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });
        last30Days.push({
          date: day.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          label: label,
          value: 0,
        });
      }

      return last30Days;
    }
    let last30Days = getLast30Days();
    let salesArray = [...sales];

    last30Days.forEach((day: any) => {
      let i = 0;
      while (i < salesArray.length) {
        const sale = salesArray[i];
        const date = sale.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        if (date === day.date) {
          day.value += Number(sale.sold) * Number(sale.price);
          salesArray.splice(i, 1);
        } else {
          i++;
        }
      }
    });

    const last30dayssales = calculateTotalSales(sales);
    const previousWeekTotal = calculateTotalSales(prevthirtyDaysAgoSales);

    let differencePercentage = 0;
    if (previousWeekTotal > 0) {
      differencePercentage =
        ((last30dayssales - previousWeekTotal) / previousWeekTotal) * 100;
    } else if (last30dayssales > 0) {
      differencePercentage = 100; // If no sales in the previous week, treat it as a 100% increase
    }

    return NextResponse.json(
      {
        error: false,
        message: "",
        sales: last30Days,
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
