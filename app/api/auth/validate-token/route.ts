import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/utils/createToken";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("authorization"); // Get token from header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: "null" },
        { status: 401 }
      );
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload & { userId: string }; // Verify token
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: "null" },
        { status: 200 }
      );
    }

    // Extract userId from the decoded token
    const userid = decoded.userId;

    // Fetch user information from the database using the userId
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userid),
      },
    });

    // If no user is found, return an error response
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: "null" },
        { status: 200 }
      );
    }

    // Generate a new authentication token for the user
    const newToken = createToken(user.id, user.email); // Create new token

    if (!newToken) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong", token: "null" },
        { status: 200 }
      );
    }

    let profiles = [];
    // Fetch manager and employee information from the database
    const manager = await prisma.manager.findFirst({
      where: { userId: user.id },
      include: { Bakery: true },
    });
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
      include: { Bakery: true },
    });

    if (manager) {
      profiles.push({
        manager: {
          id: manager.id,
          bakery: manager.Bakery,
        },
      });
    }

    if (!employee) {
      return NextResponse.json(
        { error: false, message: "Something Went Wrong" },
        { status: 200 }
      );
    }

    if (employee) {
      profiles.push({
        employee: {
          id: employee.id,
        },
      });
    }

    // Get the bakery information from either employee or manager
    const bakery = employee?.Bakery || manager?.Bakery;

    return NextResponse.json(
      {
        error: false,
        message: "success",
        data: {
          token: token,
          user: {
            name: user.name,
            email: user.email,
            id: user.id,
            bakery: bakery,
            profiles: profiles,
          },
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: true, message: "Something Went Wrong", token: null },
      { status: 200 }
    );
  }
}
