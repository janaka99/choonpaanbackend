import { ManagerSignUpSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const { email, password, name, bakery_name, confirmPassword } =
      await req.json();
    const { success, data } = ManagerSignUpSchema.safeParse({
      email,
      name,
      bakery: bakery_name,
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

        // Create Manager account
        const manager = await prisma.manager.create({
          data: {
            userId: user.id,
          },
        });

        // Create Bakery
        const bakery = await prisma.bakery.create({
          data: {
            name: data.bakery,
            managerId: manager.id, // Associate manager with bakery
          },
        });

        // Create Employee record
        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
            bakeryId: bakery.id,
          },
        });

        // Return the created entities
        return {
          user: user,
          bakery: bakery,
          manager: manager,
          employee: employee,
        };
      },
      {
        maxWait: 5000, // Maximum wait time for transaction
        timeout: 10000, // Transaction timeout
      }
    );

    // Generate token for the user
    const token = createToken(transaction.user.id, transaction.user.email);
    if (!token) {
      return NextResponse.json(
        {
          error: false,
          message: "Successfully signed up. Please logged In",
          data: null,
        },
        { status: 200 }
      );
    }

    // Prepare profiles data
    let profiles = [
      {
        manager: {
          id: transaction.manager.id,
          bakery: transaction.bakery,
        },
      },
      {
        employee: {
          id: transaction.employee.id,
        },
      },
    ];

    // Return success response
    return NextResponse.json(
      {
        error: false,
        message:
          "Account successfully created and logged in. Welcome to the platform!",
        data: {
          token: token,
          user: {
            name: transaction.user.name,
            email: transaction.user.email,
            id: transaction.user.id,
            bakery: transaction.bakery,
            profiles: profiles,
          },
        },
      },
      { status: 201 }
    );
  } catch (e) {
    // Handle errors
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
