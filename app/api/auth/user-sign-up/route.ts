import { ManagerSignUpSchema, UserSignUpSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { email, password, name, confirmPassword } = await req.json();

    const { success, data } = UserSignUpSchema.safeParse({
      email,
      name,
      password,
      confirmPassword,
    });
    if (!success) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: null },
        { status: 200 }
      );
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction
    const transaction = await prisma.$transaction(async (prisma) => {
      // Create the user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });

      await prisma.employee.create({
        data: {
          userId: user.id,
        },
      });
      return user;
    });

    const token = createToken(transaction.id, transaction.email);

    return NextResponse.json(
      {
        error: false,
        message: "Successfully registered the user",
        token: token,
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
