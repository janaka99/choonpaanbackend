import { EmployeeRegisterSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, bakery_id, confirmPassword } =
      await req.json();

    const { success, data } = EmployeeRegisterSchema.safeParse({
      email,
      name,
      bakery_id,
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

        const bekry = await prisma.bakery.findUnique({
          where: {
            id: Number(bakery_id),
          },
        });

        if (!bekry) {
          throw new Error("Bakery not found");
        }

        // Update Manager with Bakery info (you can add this if necessary)
        await prisma.employee.create({
          data: {
            userId: user.id,
            bakeryId: Number(bakery_id),
          },
        });

        // Return the created user (or you can return more if needed)
        return user;
      },
      {
        maxWait: 5000, // default: 2000
        timeout: 10000,
      }
    );

    return NextResponse.json(
      {
        error: false,
        message: "Successfully registered the user",
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
