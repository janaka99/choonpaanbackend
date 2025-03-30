import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const sales = await prisma.order.findMany({
      where: {
        seller: user.id,
      },
    });

    let totalSales = 0;

    sales.forEach((sale) => {
      totalSales += Number(sale.sold) * Number(sale.price);
    });

    return NextResponse.json(
      {
        error: false,
        message: "Sales fetched successfull",
        sales: totalSales,
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
