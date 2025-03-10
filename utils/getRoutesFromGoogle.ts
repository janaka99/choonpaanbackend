export const getRoutesFromGoogle = async (orders: any, driverLocation: any) => {
  try {
    let returnArray: any[] = [];
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].length === 0) {
        continue;
      }
      const waypoints = orders[i].map((order: any) => ({
        location: `${order.latitude},${order.longitude}`,
        stopover: true,
      }));

      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        driverLocation.latitude
      },${driverLocation.longitude}&destination=${
        waypoints[waypoints.length - 1].location
      }&waypoints=${waypoints
        .map((wp: any) => wp.location)
        .join("|")}&key=AIzaSyC1b4-xnb7a8Wfigq8yZGZ8IqkOshrEQ9c`;

      const response = await fetch(directionsUrl);
      const data = await response.json();
      const as = {
        orders: orders[i],
        route: data,
      };
      returnArray.push(as);
    }

    const routesArray = [];

    if (returnArray.length > 0) {
      for (let i = 0; i < returnArray.length; i++) {
        // Ensure routes exist
        const demandItems = getMostSoldItems(returnArray[i].orders);
        const encodedPolyline =
          returnArray[i].route.routes[0].overview_polyline.points;
        routesArray.push({
          route: encodedPolyline,
          orderInsights: demandItems,
        });
      }
    }
    return routesArray;
  } catch (error) {
    return null;
  }
};

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
