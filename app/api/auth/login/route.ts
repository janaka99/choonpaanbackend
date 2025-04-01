import { LoginSchema } from "@/schemas/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body (email and password)
    const { email, password } = await req.json();
    const { success, data } = LoginSchema.safeParse({
      email,
      password,
    });

    // If validation fails, return an error response
    if (!success) {
      return NextResponse.json(
        { error: true, message: "Email or password is incorrect", token: null },
        { status: 200 }
      );
    }

    // Fetch user information from the database using the provided email
    const user = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(), // Convert email to lowercase for consistency
      },
    });

    // If no user is found, return an error response
    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found", token: null },
        { status: 200 }
      );
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(data.password, user.password);

    // If the passwords don't match, return an error response
    if (!isMatch) {
      return NextResponse.json(
        { error: true, message: "Email or password is incorrect", token: null },
        { status: 200 }
      );
    }

    // Generate an authentication token for the user
    const token = createToken(user.id, user.email);

    // If token generation fails, return an error response
    if (!token) {
      return NextResponse.json(
        {
          error: true,
          message: "Server error occurred. Please try again later",
          token: null,
        },
        { status: 200 }
      );
    }

    // Initialize an empty array to store user profiles
    let profiles = [];

    // Check if the user is a manager and fetch their associated bakery
    const manager = await prisma.manager.findFirst({
      where: {
        userId: user.id, // Match the user ID
      },
      include: {
        Bakery: true, // Include bakery details
      },
    });

    // If the user is a manager, add their profile to the profiles array
    if (manager) {
      profiles.push({
        manager: {
          id: manager.id,
          bakery: manager.Bakery,
        },
      });
    }

    // Check if the user is an employee and fetch their associated bakery
    const employee = await prisma.employee.findFirst({
      where: {
        userId: user.id, // Match the user ID
      },
      include: {
        Bakery: true, // Include bakery details
      },
    });

    // If the user is an employee, add their profile to the profiles array
    if (employee) {
      profiles.push({
        employee: {
          id: employee.id,
        },
      });
    }

    // Determine the bakery associated with the user (either as an employee or manager)
    const bakery = employee?.Bakery || manager?.Bakery;

    // Return a success response with the user details, token, and profiles
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
    // Handle unexpected errors and return a generic error response
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
