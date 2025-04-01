import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await isLoggedIn(req);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // reset the all products stock to 0
    await prisma.product.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        stock: 0,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "The inventory has been reset.",
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
