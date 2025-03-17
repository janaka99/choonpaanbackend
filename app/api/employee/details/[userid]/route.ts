import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { isLoggedIn, isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

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
