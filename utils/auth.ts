"use server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";

export async function isLoggedIn(req: NextApiRequest | NextRequest) {
  try {
    if (!req) return null;
    //@ts-ignore
    const authHeader = req.headers.get("authorization") as string | undefined; // Get token from header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload & { userId: string }; // Verify token

    if (!decoded || !decoded.userId) {
      return null;
    }
    const userid = decoded.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userid),
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function isMangerLoggedInWithBakery(
  req: NextApiRequest | NextRequest
) {
  try {
    if (!req) return null;
    //@ts-ignore
    const authHeader = req.headers.get("authorization") as string | undefined; // Get token from header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload & { userId: string }; // Verify token

    if (!decoded || !decoded.userId) {
      return null;
    }
    const userid = decoded.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userid),
      },
    });

    if (!user) {
      return null;
    }
    const manager = await prisma.manager.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        Bakery: true,
      },
    });

    if (!user) {
      return null;
    }
    if (!manager || !manager.Bakery) {
      return null;
    }
    const bakery = manager.Bakery;
    return { ...user, bakery };
  } catch (error) {
    return null;
  }
}
