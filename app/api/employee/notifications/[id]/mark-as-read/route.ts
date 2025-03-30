import { isLoggedIn } from "@/utils/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: any,
  { params: useridparam }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await useridparam;
    if (!id) {
      return NextResponse.json(
        { error: true, message: "Internal server error" },
        { status: 500 }
      );
    }
    const user = await isLoggedIn(req);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.notification.update({
      where: {
        userid: user.id,
        id: Number(id),
      },
      data: {
        isRead: true,
      },
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userid: user.id,
      },
    });

    return NextResponse.json(
      {
        error: false,
        message: "",
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
