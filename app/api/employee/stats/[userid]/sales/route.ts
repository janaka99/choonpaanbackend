import { prisma } from "@/lib/prisma";
import { NextApiRequest } from "next";
import { isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextResponse } from "next/server";

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
      { error: true, message: "Unauthorized Request" },
      { status: 401 }
    );
  }

  try {
    const sales = await prisma.order.findMany({
      where: {
        seller: Number(userid),
        bakeryId: user.bakery.id,
      },
      select: {
        sold: true,
        price: true,
      },
    });

    const totalSales = sales.reduce(
      (acc, order) => acc + Number(order.sold) * Number(order.price),
      0
    );

    const totalRevenue = (totalSales / 100) * 40;

    return NextResponse.json(
      {
        error: false,
        message: "",
        sales: {
          totalSales: totalSales,
          totalRevenue: totalRevenue,
        },
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
