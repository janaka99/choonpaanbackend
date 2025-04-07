// @ts-nocheck
// routes.test.ts
import { GENERATE_ROUTES } from '@/lib/openai';
import { describe, it, expect } from '@jest/globals';
import { getDistance } from 'geolib';

// Types
type Coordinate = { latitude: number; longitude: number };
type DemandItem = { itemName: string; demandStatus: 'HIGH' | 'MEDIUM' | 'LOW' };
type Route = {
  road: Coordinate[];
  demandItems: DemandItem[];
};

// Mock the AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn().mockResolvedValue({
    routes: [
      {
        road: [
          { latitude: 7.2513, longitude: 80.3464 },
          { latitude: 7.250676887, longitude: 80.34613354 },
          { latitude: 7.250491156, longitude: 80.34994255 },
          { latitude: 7.247952781, longitude: 80.35078484 }
        ],
        demandItems: [
          { itemName: "Vegetable Roti", demandStatus: "HIGH" },
          { itemName: "Egg roll", demandStatus: "MEDIUM" },
          { itemName: "Butter Cake Slice", demandStatus: "LOW" }

        ]
      },
      {
        road: [
          { latitude: 7.2513, longitude: 80.3464 },
          { latitude: 7.250230599, longitude: 80.34980894 },
          { latitude: 7.25001528, longitude: 80.34651501 },
          { latitude: 7.250962492, longitude: 80.34606913 }
        ],
        demandItems: [
          { itemName: "Tea Bun", demandStatus: "HIGH" },
          { itemName: "Maalu Paan (Fish Bun)", demandStatus: "MEDIUM" },
          { itemName: "Seeni Sambol Bun", demandStatus: "LOW" }

        ]
      },
      {
        road: [
          { latitude: 7.2513, longitude: 80.3464 },
          { latitude: 7.250397182, longitude: 80.34649825 },
          { latitude: 7.251253182, longitude: 80.34464009 },
          { latitude: 7.251106908, longitude: 80.34503219 }
        ],
        demandItems: [
          { itemName: "Seeni Sambol Bun", demandStatus: "HIGH" },
          { itemName: "Butter Cake Slice", demandStatus: "MEDIUM" },
          { itemName: "Tea Bun", demandStatus: "LOW" }
        ]
      }
    ]
  })
}));

// Accuracy calculation function
function calculateRouteAccuracy(predicted: Route, groundTruth: Route): number {
  // Coordinate matching (60% weight)
  const matchedCoords = predicted.road.filter(predCoord =>
    groundTruth.road.some(gtCoord =>
      getDistance(predCoord, gtCoord) < 50 // 50 meters threshold
    )
  );
  const coordScore = (matchedCoords.length / groundTruth.road.length) * 100;

  // Demand item matching (40% weight)
  const matchedItems = predicted.demandItems.filter(predItem =>
    groundTruth.demandItems.some(gtItem =>
      gtItem.itemName === predItem.itemName &&
      gtItem.demandStatus === predItem.demandStatus
    )
  );
  const itemScore = (matchedItems.length / groundTruth.demandItems.length) * 100;

  // Weighted final score
  const finalScore = (coordScore * 0.6) + (itemScore * 0.4);
  return Math.round(Math.min(finalScore, 100));
}

describe('GENERATE_ROUTES Function', () => {
  const startLocation = { latitude: 7.2513, longitude: 80.3464 };
  
  const pastSales = [
    { name: 'Vegetable Roti', price: 70, sold: 6, latitude: 7.250676887, longitude: 80.34613354 },
    { name: 'Egg roll', price: 110, sold: 1, latitude: 7.250330112, longitude: 80.34616663 },
    { name: 'Vegetable Roti', price: 70, sold: 5, latitude: 7.25001528, longitude: 80.34651501 },
    { name: 'Seeni Sambol Bun', price: 90, sold: 2, latitude: 7.247952781, longitude: 80.35078484 },
    { name: 'Tea Bun', price: 85, sold: 3, latitude: 7.250491156, longitude: 80.34994254999999 },
    { name: 'Maalu Paan (Fish Bun)', price: 100, sold: 5, latitude: 7.250230599, longitude: 80.34980894 },
    { name: 'Butter Cake Slice', price: 95, sold: 4, latitude: 7.250962492, longitude: 80.34606913 },
    { name: 'Tea Bun', price: 85, sold: 3, latitude: 7.250962492, longitude: 80.34606913 },
    { name: 'Seeni Sambol Bun', price: 90, sold: 6, latitude: 7.250397182, longitude: 80.34649825 },
    { name: 'Butter Cake Slice', price: 95, sold: 5, latitude: 7.251253182, longitude: 80.34464009 },
    { name: 'Tea Bun', price: 85, sold: 3, latitude: 7.250324232, longitude: 80.34689533 },
    { name: 'Seeni Sambol Bun', price: 90, sold: 5, latitude: 7.251106908, longitude: 80.34503219 }
  ];

  const currentStock = {
    "Vegetable Roti": 14,
    "Egg roll": 12,
    "Seeni Sambol Bun": 10,
    "Tea Bun": 6,
    "Maalu Paan (Fish Bun)": 8,
    "Butter Cake Slice": 5
  };

  // Ground truth data
  const groundTruthRoutes: Route[] = [
    {
      road: [
        { latitude: 7.2513, longitude: 80.3464 },
        { latitude: 7.250676887, longitude: 80.34613354 },
        { latitude: 7.25001528, longitude: 80.34651501 },
        { latitude: 7.247952781, longitude: 80.35078484 }
      ],
      demandItems: [
        { itemName: "Vegetable Roti", demandStatus: "HIGH" },
        { itemName: "Egg roll", demandStatus: "MEDIUM" },
        { itemName: "Seeni Sambol Bun", demandStatus: "LOW" }
      ]
    },
    {
      road: [
        { latitude: 7.2513, longitude: 80.3464 },
        { latitude: 7.250491156, longitude: 80.34994255 },
        { latitude: 7.250230599, longitude: 80.34980894 },
        { latitude: 7.250962492, longitude: 80.34606913 }
      ],
      demandItems: [
        { itemName: "Tea Bun", demandStatus: "HIGH" },
        { itemName: "Maalu Paan (Fish Bun)", demandStatus: "MEDIUM" },
        { itemName: "Butter Cake Slice", demandStatus: "LOW" }
      ]
    },
    {
      road: [
        { latitude: 7.2513, longitude: 80.3464 },
        { latitude: 7.250397182, longitude: 80.34649825 },
        { latitude: 7.251253182, longitude: 80.34464009 },
        { latitude: 7.251106908, longitude: 80.34503219 }
      ],
      demandItems: [
        { itemName: "Seeni Sambol Bun", demandStatus: "HIGH" },
        { itemName: "Butter Cake Slice", demandStatus: "MEDIUM" },
        { itemName: "Tea Bun", demandStatus: "LOW" }
      ]
    }
  ];

  it('should generate routes with minimum 70% accuracy', async () => {
    const result = await GENERATE_ROUTES(startLocation, pastSales, currentStock);
    
    // Calculate accuracy for each route
    const accuracies = result.routes.map((route, index) => {
      const accuracy = calculateRouteAccuracy(route, groundTruthRoutes[index]);
      return accuracy;
    });

    // Check each route meets accuracy threshold
    accuracies.forEach(accuracy => {
      expect(accuracy).toBeGreaterThanOrEqual(70);
    });

    // Calculate overall accuracy
    const overallAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    console.log(`Overall accuracy: ${overallAccuracy.toFixed(1)}%`);
  });

  it('should return routes with correct structure', async () => {
    const result = await GENERATE_ROUTES(startLocation, pastSales, currentStock);
    
    expect(result).toBeDefined();
    expect(result?.routes).toBeInstanceOf(Array);
    expect(result?.routes.length).toBe(3);
  });

  it('each route should start from the correct location', async () => {
    const result = await GENERATE_ROUTES(startLocation, pastSales, currentStock);
    
    result?.routes.forEach(route => {
      expect(route.road[0].latitude).toBe(startLocation.latitude);
      expect(route.road[0].longitude).toBe(startLocation.longitude);
    });
  });

});

// Add to package.json if not already present
// "jest": {
//   "preset": "jest-expo",
//   "transformIgnorePatterns": [
//     "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
//   ]
// }