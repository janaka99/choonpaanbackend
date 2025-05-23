import { prisma } from "@/lib/prisma";
import { isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: any,
  { params }: { params: Promise<{ userid: string }> }
) {
  const { userid } = await params;
  if (!userid) {
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
  // Check if the user is logged in as a manager with a bakery
  const user = await isMangerLoggedInWithBakery(req);

  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized Request" },
      { status: 401 }
    );
  }

  try {
    // Fetch employee details associated with the bakery
    const employee = await prisma.employee.findUnique({
      where: {
        id: Number(userid),
      },
      select: {
        id: true,
        user: true,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "",
        user: employee?.user,
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
