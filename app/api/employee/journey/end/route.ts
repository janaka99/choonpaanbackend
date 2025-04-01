import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong. Try again later" },
        { status: 500 }
      );
    }
    // Check if the journey exists and belongs to the user
    await prisma.journey.update({
      where: {
        id: Number(id),
        userid: user.id,
      },
      data: {
        endAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Journey has been ended",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
