import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextApiResponse) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc", // Sorts from newest to oldest
      },
    });
    return NextResponse.json(
      {
        error: false,
        message: "Product fetched successfull",
        products: products,
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
