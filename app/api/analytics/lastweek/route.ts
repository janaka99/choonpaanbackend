import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
// @ts-ignore
import geoDistance from "geo-distance";
import { RADIUS } from "@/constants";

export async function GET(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const location = await prisma.currentLocation.findFirst({
      where: { userid: user.id },
    });

    if (!location) {
      return NextResponse.json(
        { error: true, message: "Internal server error" },
        { status: 500 }
      );
    }

    // const { latitude: userLat, longitude: userLon } = location;

    const todayStart = startOfDay(new Date());

    const sevenDaysAgo = subDays(todayStart, 7);

    const orders = await prisma.order.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        createdAt: {
          gte: sevenDaysAgo,
          lt: todayStart,
        },
      },
    });
    const radius = RADIUS; // in meters
    // latitude: 6.924575,
    // longitude: 79.987234,
    const ordersWithinRadius = orders.filter((order) => {
      const distance = geoDistance
        .between(
          { lat: 6.92457, lon: 79.987234 },
          { lat: order.latitude, lon: order.longitude }
        )
        .human_readable();
      return distance.distance <= radius;
    });

    return NextResponse.json(
      {
        error: false,
        message: "Product fetched successfull",
        orders: ordersWithinRadius,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
        },
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
