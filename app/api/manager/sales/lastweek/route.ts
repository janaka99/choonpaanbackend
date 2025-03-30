import { prisma } from "@/lib/prisma";
import { isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
import { calculateTotalSales } from "@/utils/calculateTotalSales";

export async function GET(req: NextRequest) {
  const user = await isMangerLoggedInWithBakery(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const todayStart = startOfDay(new Date());
    const sevenDaysAgo = subDays(todayStart, 7);
    const fourteenDaysAgo = subDays(todayStart, 14);

    const sales = await prisma.order.findMany({
      where: {
        bakeryId: user.bakery.id,
        createdAt: {
          gte: sevenDaysAgo,
          lt: todayStart,
        },
      },
    });

    // Fetch sales for the previous 7 days
    const previousWeekSales = await prisma.order.findMany({
      where: {
        bakeryId: user.bakery.id,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    function getLast7Days() {
      const today = new Date();
      const last7Days = [];

      for (let i = 1; i <= 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        last7Days.push({
          date: day.toLocaleDateString(),
          label: day.toLocaleDateString("en-US", { weekday: "short" }),
          value: 0,
        });
      }

      return last7Days;
    }

    let last7Days = getLast7Days();

    let salesArray = [...sales];

    last7Days.forEach((day: any) => {
      let i = 0;
      while (i < salesArray.length) {
        const sale = salesArray[i];
        const date = sale.createdAt.toLocaleDateString();

        if (date === day.date) {
          day.value += Number(sale.sold) * Number(sale.price);
          salesArray.splice(i, 1);
        } else {
          i++;
        }
      }
    });

    const lastWeekTotal = calculateTotalSales(sales);
    const previousWeekTotal = calculateTotalSales(previousWeekSales);

    let differencePercentage = 0;
    if (previousWeekTotal > 0) {
      differencePercentage =
        ((lastWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
    } else if (lastWeekTotal > 0) {
      differencePercentage = 100; // If no sales in the previous week, treat it as a 100% increase
    }

    return NextResponse.json(
      {
        error: false,
        message: "",
        sales: last7Days,
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
