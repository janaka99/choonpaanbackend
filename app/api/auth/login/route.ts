import { LoginSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest) {
  try {
    // pass and validate request body
    const { email, password } = await req.json();
    const { success, data } = LoginSchema.safeParse({
      email,
      password,
    });
    if (!success) {
      return NextResponse.json(
        { error: true, message: "Email or password is incorrect", token: null },
        { status: 200 }
      );
    }

    // fecth user information from the database
    const user = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found", token: null },
        { status: 200 }
      );
    }
    // compare passwords
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: true, message: "Email or password is incorrect", token: null },
        { status: 200 }
      );
    }

    const token = createToken(user.id, user.email);
    if (!token) {
      return NextResponse.json(
        {
          error: true,
          message: "Server error occured.Please try again later",
          token: null,
        },
        { status: 200 }
      );
    }
    let profiles = [];

    const manager = await prisma.manager.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        Bakery: true,
      },
    });
    if (manager) {
      profiles.push({
        manager: {
          id: manager.id,
          bakery: manager.Bakery,
        },
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        Bakery: true,
      },
    });

    if (employee) {
      profiles.push({
        employee: {
          id: employee.id,
        },
      });
    }

    // Get Bakery from either Employee or Manager
    const bakery = employee?.Bakery || manager?.Bakery;

    return NextResponse.json(
      {
        error: false,
        message: "Successfully logged In",
        data: {
          token: token,
          user: {
            name: user.name,
            email: user.email.toLowerCase(),
            id: user.id,
            bakery: bakery,
            profiles: profiles,
          },
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: true,
        message: "An unexpected error occurred. Please try again later.",
        token: null,
      },
      { status: 200 }
    );
  }
}
