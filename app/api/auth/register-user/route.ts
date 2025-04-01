import { EmployeeRegisterSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to extract user details
    const { email, password, name, bakery_id, confirmPassword } =
      await req.json();

    // Validate the input data using the EmployeeRegisterSchema
    const { success, data } = EmployeeRegisterSchema.safeParse({
      email,
      name,
      bakery_id,
      password,
      confirmPassword,
    });
    if (!success) {
      // Return an error response if validation fails
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: null },
        { status: 200 }
      );
    }

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a database transaction
    const transaction = await prisma.$transaction(
      async (prisma) => {
        // Create a new user in the database
        const user = await prisma.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
          },
        });

        // Check if the bakery exists
        const bekry = await prisma.bakery.findUnique({
          where: {
            id: Number(bakery_id),
          },
        });

        if (!bekry) {
          // Throw an error if the bakery is not found
          throw new Error("Bakery not found");
        }

        // Link the user to the bakery by creating an employee record
        await prisma.employee.create({
          data: {
            userId: user.id,
            bakeryId: Number(bakery_id),
          },
        });

        // Return the created user
        return user;
      },
      {
        maxWait: 5000, // Maximum wait time for the transaction
        timeout: 10000, // Timeout for the transaction
      }
    );

    // Return a success response
    return NextResponse.json(
      {
        error: false,
        message: "Successfully registered the user",
      },
      { status: 201 }
    );
  } catch (e) {
    // Handle errors and return a generic error response
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
