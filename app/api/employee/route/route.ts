import { prisma } from "@/lib/prisma";
import { isLoggedIn } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, subDays } from "date-fns";
// @ts-ignore
import geoDistance from "geo-distance";
import { RADIUS } from "@/constants";
import { getRoutesFromGoogleOpenAI } from "@/utils/getRoutesFromGoogle";
import { GENERATE_ROUTES } from "@/lib/openai";

export async function GET(req: NextRequest) {
  const user = await isLoggedIn(req);
  if (!user) {
    return NextResponse.json(
      { error: true, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // get the current location of the user
    const location = await prisma.currentLocation.findFirst({
      where: { userid: user.id },
    });

    if (!location) {
      return NextResponse.json(
        { error: true, message: "Choose location to start" },
        { status: 200 }
      );
    }

    // get the today's date
    const todayStart = startOfDay(new Date());

    // get the date 7 days ago
    const sevenDaysAgo = subDays(todayStart, 7);

    // find the all the orders last week belongs to the user
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

    // find the all the products belongs to the user
    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
    });
    // console.log("Products my ", products)
    // find  started journey of the user
    const journey = await prisma.journey.findFirst({
      where: {
        userid: user.id,
        endAt: null,
      },
    });

    // find the neareset drivers
    const drivers = await prisma.liveLocation.findMany();
    const radius = RADIUS; // in meters in this case  ( 10,000m )

    // filtered the drivers withing 10Km range
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

    // filter orders within 10Km ( 10,000m ) range
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

    // console.log("Orders withing the radisu ", ordersWithinRadius)

     if(ordersWithinRadius.length < 5) {
      return NextResponse.json(
        {
          error: false,
          message: "Product fetched successfull",
          orders: JSON.stringify([]),
          possibleRoutes: JSON.stringify([]) || [],
          otherDrivers: JSON.stringify([]) || [],
          journey: JSON.stringify(journey) || null,
          location: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
          }),
        },
        { status: 200 }
      );
     }
    // this function used to generated possible routes using AI
    const result = await GENERATE_ROUTES(
      location,
      ordersWithinRadius,
      products
    );

    let rt = result?.object.routes;
    // this function converts those routes to data that google map api can read
    const routesFromGoogleOpenAI = await getRoutesFromGoogleOpenAI(
      rt,
      location
    );

    return NextResponse.json(
      {
        error: false,
        message: "Product fetched successfull",
        orders: JSON.stringify(ordersWithinRadius),
        possibleRoutes: JSON.stringify(routesFromGoogleOpenAI) || [],
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

// function getMostSoldItems(orders: any) {
//   const productSales: {
//     [key: string]: { productId: string; name: string; totalSold: number };
//   } = {};

//   orders.forEach((order: any) => {
//     const { productId, sold, Product } = order;
//     if (!productSales[productId]) {
//       productSales[productId] = { productId, name: Product.name, totalSold: 0 };
//     }
//     productSales[productId].totalSold += sold;
//   });

//   return Object.values(productSales)
//     .filter((product) => product.totalSold > 0)
//     .map((product) => ({
//       ...product,
//       demand:
//         product.totalSold > 17
//           ? "High"
//           : product.totalSold > 10
//           ? "Medium"
//           : "Low",
//     }))
//     .sort((a, b) => b.totalSold - a.totalSold);
// }

// export const getRoutesFromGoogleOpenAI = async (
//   routes: any,
//   driverLocation: any
// ) => {
//   try {
//     let returnArray: any[] = [];
//     for (let i = 0; i < routes.length; i++) {
//       if (routes[i].length === 0) {
//         continue;
//       }
//       const waypoints = routes[i].road.map((order: any) => ({
//         location: `${order.latitude},${order.longitude}`,
//         stopover: true,
//       }));
//       const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${
//         driverLocation.latitude
//       },${driverLocation.longitude}&destination=${
//         waypoints[waypoints.length - 1].location
//       }&waypoints=${waypoints
//         .map((wp: any) => wp.location)
//         .join("|")}&key=AIzaSyC1b4-xnb7a8Wfigq8yZGZ8IqkOshrEQ9c`;

//       const response = await fetch(directionsUrl);
//       const data = await response.json();
//       const as = {
//         orders: routes[i].demandItems,
//         route: data,
//       };

//       returnArray.push(as);
//     }

//     const routesArray = [];
//     if (returnArray.length > 0) {
//       for (let i = 0; i < returnArray.length; i++) {
//         // Ensure routes exist
//         const encodedPolyline =
//           returnArray[i].route.routes[0].overview_polyline.points;
//         routesArray.push({
//           route: encodedPolyline,
//           orderInsights: returnArray[i].orders,
//         });
//       }
//     }
//     return routesArray;
//   } catch (error) {
//     return null;
//   }
// };
