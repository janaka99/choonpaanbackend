interface Location {
  latitude: any;
  longitude: any;
  name?: string;
}

interface Routes {
  northToEast: Location[];
  eastToSouth: Location[];
  southToWest: Location[];
  westToNorth: Location[];
}

export const getPossibleRoutes = (
  bakeryLocation: Location,
  deliveryLocations: Location[]
): Location[][] => {
  // Function to determine if a delivery is North, South, East, or West of the bakery
  const getDirectionFromBakery = (
    bakery: Location,
    location: Location
  ): string => {
    const { latitude, longitude } = location;
    const bakeryLatitude = bakery.latitude;
    const bakeryLongitude = bakery.longitude;

    let direction = "";

    if (latitude > bakeryLatitude) {
      direction = "North";
    } else if (latitude < bakeryLatitude) {
      direction = "South";
    }

    if (longitude > bakeryLongitude) {
      direction += direction ? " to East" : "";
    } else if (longitude < bakeryLongitude) {
      direction += direction ? " to West" : "";
    }

    return direction || "Center"; // In case the location is directly at the bakery
  };

  // Organize the locations into routes
  const routes: Routes = {
    northToEast: [],
    eastToSouth: [],
    southToWest: [],
    westToNorth: [],
  };

  // Categorize each delivery location based on direction from bakery
  deliveryLocations.forEach((location) => {
    const direction = getDirectionFromBakery(bakeryLocation, location);

    if (direction === "North to East") {
      routes.northToEast.push(location);
    } else if (direction === "South to East") {
      routes.eastToSouth.push(location);
    } else if (direction === "South to West") {
      routes.southToWest.push(location);
    } else if (direction === "North to West") {
      routes.westToNorth.push(location);
    }
  });

  const routesArray: Location[][] = [
    routes.northToEast,
    routes.eastToSouth,
    routes.southToWest,
    routes.westToNorth,
  ];
  // Remove empty arrays before returning
  const filteredRoutesArray = routesArray.filter((route) => route.length > 0);
  return filteredRoutesArray;
};
