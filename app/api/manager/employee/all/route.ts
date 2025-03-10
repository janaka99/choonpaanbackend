import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { isMangerLoggedInWithBakery } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextApiResponse) {
  const user = await isMangerLoggedInWithBakery(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const employees = await prisma.employee.findMany({
      where: {
        bakeryId: user.bakery.id,
      },
      include: {
        user: true,
      },
    });
    console.log(employees);
    return NextResponse.json(
      {
        error: false,
        message: "Employees fetched successfull",
        employees: employees,
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
