import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { isLoggedIn, isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";

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
    const sevenDaysAgo = subDays(todayStart, 7);

    const sales = await prisma.order.findMany({
      where: {
        seller: Number(userid),
        bakeryId: user.bakery.id,
        createdAt: {
          gte: sevenDaysAgo,
          lt: todayStart,
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

    return NextResponse.json(
      {
        error: false,
        message: "",
        sales: last7Days,
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
