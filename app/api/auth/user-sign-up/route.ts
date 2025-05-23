import { UserSignUpSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the incoming request body using the schema
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

    // Check if a user with the same email already exists
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

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);


    // Start a transaction to create both user and employee records
    const transaction = await prisma.$transaction(
      async (prisma:any) => {
        // Create the user record
        const user = await prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
          },
        });

        // Create the associated employee record
        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
          },
        });
        return { user, employee };
      },
      {
        maxWait: 5000, // Maximum wait time for the transaction
        timeout: 10000, // Timeout for the transaction
      }
    );

    // Generate a token for the newly created user
    const token = createToken(transaction.user.id, transaction.user.email);

    // Return a success response with the user and token details
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
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
