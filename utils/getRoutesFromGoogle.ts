// export const getRoutesFromGoogle = async (orders: any, driverLocation: any) => {
//   try {
//     let returnArray: any[] = [];
//     for (let i = 0; i < orders.length; i++) {
//       if (orders[i].length === 0) {
//         continue;
//       }
//       const waypoints = orders[i].map((order: any) => ({
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
//         orders: orders[i],
//         route: data,
//       };
//       returnArray.push(as);
//     }

//     const routesArray = [];

//     if (returnArray.length > 0) {
//       for (let i = 0; i < returnArray.length; i++) {
//         // Ensure routes exist
//         const demandItems = getMostSoldItems(returnArray[i].orders);
//         const encodedPolyline =
//           returnArray[i].route.routes[0].overview_polyline.points;
//         routesArray.push({
//           route: encodedPolyline,
//           orderInsights: demandItems,
//         });
//       }
//     }
//     return routesArray;
//   } catch (error) {
//     return null;
//   }
// };

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

export const getRoutesFromGoogleOpenAI = async (
  routes: any,
  driverLocation: any
) => {
  try {
    let returnArray: any[] = [];

    // Loop through each route in the input
    for (let i = 0; i < routes.length; i++) {
      // Skip if the route is empty
      if (routes[i].length === 0) {
        continue;
      }

      // Create waypoints for the route using latitude and longitude
      const waypoints = routes[i].road.map((order: any) => ({
        location: `${order.latitude},${order.longitude}`,
        stopover: true,
      }));

      // Construct the Google Directions API URL with origin, destination, and waypoints
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        driverLocation.latitude
      },${driverLocation.longitude}&destination=${
        waypoints[waypoints.length - 1].location
      }&waypoints=${waypoints
        .map((wp: any) => wp.location)
        .join("|")}&key=AIzaSyC1b4-xnb7a8Wfigq8yZGZ8IqkOshrEQ9c`;

      // Fetch the route data from Google Directions API
      const response = await fetch(directionsUrl);
      const data = await response.json();

      // Combine the route data with the demand items for the current route
      const as = {
        orders: routes[i].demandItems,
        route: data,
      };

      // Add the combined data to the return array
      returnArray.push(as);
    }

    const routesArray = [];

    // Process the fetched routes to extract encoded polylines and order insights
    if (returnArray.length > 0) {
      for (let i = 0; i < returnArray.length; i++) {
        // Extract the encoded polyline for the route
        const encodedPolyline =
          returnArray[i].route.routes[0].overview_polyline.points;

        // Add the route and order insights to the final routes array
        routesArray.push({
          route: encodedPolyline,
          orderInsights: returnArray[i].orders,
        });
      }
    }

    // Return the processed routes array
    return routesArray;
  } catch (error) {
    // Return null if an error occurs
    return null;
  }
};
