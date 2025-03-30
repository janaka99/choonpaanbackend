import { NextApiRequest } from "next";
import { isLoggedIn } from "@/utils/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextApiRequest) {
  try {
    const user = await isLoggedIn(req);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userid: user.id,
      },
      orderBy: {
        createdAt: "desc", // Orders by newest first
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Notification has been fetched",
        notifications: JSON.stringify(notifications) || JSON.stringify([]),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
