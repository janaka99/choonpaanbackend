import { isLoggedIn } from "@/utils/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: any) {
  try {
    const user = await isLoggedIn(req);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notificationCount = await prisma.notification.count({
      where: {
        userid: user.id,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "Notification has been fetched",
        count: JSON.stringify(notificationCount) || JSON.stringify(0),
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
