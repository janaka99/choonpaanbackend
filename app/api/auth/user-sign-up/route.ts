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
        { error: true, message: "Something Went Wrong", data: null },
        { status: 200 }
      );
    }

    const userHave = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (userHave) {
      return NextResponse.json(
        { error: true, message: "Email is already taken", data: null },
        { status: 200 }
      );
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction
    const transaction = await prisma.$transaction(
      async (prisma) => {
        // Create the user
        const user = await prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
          },
        });

        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
          },
        });
        return { user, employee };
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000,
      }
    );

    const token = createToken(transaction.user.id, transaction.user.email);

    return NextResponse.json(
      {
        error: false,
        message: "Successfully registered the user",
        data: {
          token: token,
          user: {
            name: transaction.user.name,
            email: transaction.user.email,
            id: transaction.user.id,
            bakery: null,
            profiles: [
              {
                employee: {
                  id: transaction.employee.id,
                },
              },
            ],
          },
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
