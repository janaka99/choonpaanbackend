import { EmployeeRegisterSchema, ManagerSignUpSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { email, password } = await req.json();

    const { success, data } = EmployeeRegisterSchema.safeParse({
      email,
      password,
    });
    if (!success) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: null },
        { status: 200 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found", token: null },
        { status: 200 }
      );
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: true, message: "Invalid Credentials", token: null },
        { status: 200 }
      );
    }

    const token = createToken(user.id, user.email);
    let profiles = [];
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (employee) {
      profiles.push({ employee: { employee } });
    }
    const manager = await prisma.manager.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (manager) {
      profiles.push({ manager: { manager } });
    }
    return NextResponse.json(
      {
        error: false,
        message: "Successfully logged In",
        token: token,
        profiles: profiles,
      },
      { status: 201 }
    );
  } catch (e) {
    console.log("error ", e);
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
