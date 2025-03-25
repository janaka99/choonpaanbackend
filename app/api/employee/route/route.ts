import { prisma } from "@/lib/prisma";
import { NextApiResponse } from "next";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
// @ts-ignore
import geoDistance from "geo-distance";
import { RADIUS } from "@/constants";
import { getPossibleRoutes } from "@/utils/getPossibleRoutsFromOrders";
import {
  getRoutesFromGoogle,
  getRoutesFromGoogleOpenAI,
} from "@/utils/getRoutesFromGoogle";
import { GENERATE_ROUTES } from "@/lib/openai";

export async function GET(req: NextRequest, res: NextApiResponse) {
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
        { error: true, message: "Choose location to start" },
        { status: 200 }
      );
    }

    const todayStart = startOfDay(new Date());

    const sevenDaysAgo = subDays(todayStart, 7);

    const orders = await prisma.order.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        // createdAt: {
        //   gte: sevenDaysAgo,
        //   lt: todayStart,
        // },
      },
      include: {
        Product: true,
      },
    });

    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
    });

    const journey = await prisma.journey.findFirst({
      where: {
        userid: user.id,
        endAt: null,
      },
    });

    const drivers = await prisma.liveLocation.findMany();
    const radius = RADIUS; // in meters

    const driverWithintheRadius = drivers.filter((driver) => {
      const distance = geoDistance
        .between(
          { lat: location.latitude, lon: location.longitude },
          { lat: driver.latitude, lon: driver.longitude }
        )
        .human_readable();

      if (distance.unit == "km") {
        return distance.distance <= radius / 1000;
      }
      return distance.distance <= radius;
    });
    // console.log(driverWithintheRadius);

    const ordersWithinRadius = orders.filter((order) => {
      const distance = geoDistance
        .between(
          { lat: location.latitude, lon: location.longitude },
          { lat: order.latitude, lon: order.longitude }
        )
        .human_readable();

      if (distance.unit == "km") {
        return distance.distance <= radius / 1000;
      }
      return distance.distance <= radius;
    });

    const result = await GENERATE_ROUTES(
      location,
      ordersWithinRadius,
      products
    );

    const demandItems = getMostSoldItems(ordersWithinRadius);
    const possibleRoutes = getPossibleRoutes(
      { latitude: location.latitude, longitude: location.longitude },
      ordersWithinRadius
    );
    // console.log("Possible routes ", possibleRoutes);
    const routesFromGoogle = await getRoutesFromGoogle(
      possibleRoutes,
      location
    );
    let rt = result?.object.routes;
    const routesFromGoogleOpenAI = await getRoutesFromGoogleOpenAI(
      rt,
      location
    );

    // console.log("Routes From Gooel ", routesFromGoogle);
    // console.log("Routes From OpenAI ", routesFromGoogleOpenAI);
    return NextResponse.json(
      {
        error: false,
        message: "Product fetched successfull",
        orders: JSON.stringify(ordersWithinRadius),
        possibleRoutes: JSON.stringify(routesFromGoogleOpenAI) || [],
        demandItems: JSON.stringify(demandItems) || [],
        otherDrivers: JSON.stringify(driverWithintheRadius) || [],
        journey: JSON.stringify(journey) || null,
        location: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
        }),
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

function getMostSoldItems(orders: any) {
  const productSales: {
    [key: string]: { productId: string; name: string; totalSold: number };
  } = {};

  orders.forEach((order: any) => {
    const { productId, sold, Product } = order;
    if (!productSales[productId]) {
      productSales[productId] = { productId, name: Product.name, totalSold: 0 };
    }
    productSales[productId].totalSold += sold;
  });

  return Object.values(productSales)
    .filter((product) => product.totalSold > 0)
    .map((product) => ({
      ...product,
      demand:
        product.totalSold > 17
          ? "High"
          : product.totalSold > 10
          ? "Medium"
          : "Low",
    }))
    .sort((a, b) => b.totalSold - a.totalSold);
}
