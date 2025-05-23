import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    // Check if the user has a current location record
    const currentLocationRecord = await prisma.currentLocation.findFirst({
      where: {
        userid: user.id,
      },
    });
    if (!currentLocationRecord) {
      return NextResponse.json(
        { error: true, message: "Location not  selected" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: false,
        message: "Location has been successfully updated",
        location: JSON.stringify({
          latitude: currentLocationRecord.latitude,
          longitude: currentLocationRecord.longitude,
          name: currentLocationRecord.name,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
