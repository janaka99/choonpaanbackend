import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { latitude, longitude, name } = await req.json();
  try {
    if (!latitude || !longitude || !name) {
      return NextResponse.json(
        { error: true, message: "Something Went Wrong" },
        { status: 500 }
      );
    }

    const currentLocationRecord = await prisma.currentLocation.findFirst({
      where: {
        userid: user.id,
      },
    });
    let location;
    if (currentLocationRecord) {
      location = await prisma.currentLocation.update({
        where: {
          id: currentLocationRecord.id,
        },
        data: {
          latitude: latitude,
          longitude: longitude,
          name: name,
        },
      });
    } else {
      location = await prisma.currentLocation.create({
        data: {
          latitude: latitude,
          longitude: longitude,
          name: name,
          userid: user.id,
        },
      });
    }

    return NextResponse.json(
      {
        error: false,
        message: "Location has been successfully updated",
        location: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
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
