import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const GENERATE_ROUTES = async (
  startLocation: any,
  pastSales: any,
  currentStock: any
) => {
  try {
    // Ensuring input structure
    if (!startLocation || !pastSales || !currentStock) {
      throw new Error(
        "Missing required parameters: startLocation, pastSales, or currentStock"
      );
    }

    const result = await generateObject({
      model: openai("gpt-4o-2024-08-06", {
        structuredOutputs: true,
      }),
      schemaName: "route",
      schemaDescription:
        "Generates 3 optimized delivery routes with stop points and demand items.",
      schema: z.object({
        routes: z.array(
          z.object({
            road: z.array(
              z.object({
                latitude: z.number(),
                longitude: z.number(),
              })
            ),
            demandItems: z.array(
              z.object({
                itemName: z.string(),
                demandStatus: z.enum(["HIGH", "MEDIUM", "LOW"]),
              })
            ),
          })
        ),
      }),
      prompt: `You are an AI that generates optimized delivery routes for a Choon Paan (mobile bakery) driver. Your goal is to suggest the **3 best possible routes** based on past sales trends and current stock availability.

            ### **Optimization Strategy**
            - **Fixed Start Location**: Every route starts from the same location.
            - **Different End Locations**: Each of the 3 routes should end in a different area (e.g., Route 1: A → B, Route 2: A → C, Route 3: A → D).
            - **Demand-Based Route Planning**: Prioritize locations with high past sales and balance demand across routes.
            - **Scalability**: Ensure efficiency by **analyzing past orders without sending excessive data in a single request**.

            ### **Requirements**
            1. Generate **exactly 3 unique routes**, each with **at least 3 stops**.
            2. All routes must **start from the same location**.
            3. Each route must **end in a different area** based on demand trends.
            4. Assign **high, medium, and low-demand levels** to items per route.
            5. Optimize routes based on past sales data and available stock.
            6. **Avoid unnecessary overlaps** to maximize coverage.

            ### **Input Data**
            - **Start Location (Fixed):** ${JSON.stringify(startLocation)}
            - **Past Sales Data:** ${JSON.stringify(pastSales)}
            - **Current Stock:** ${JSON.stringify(currentStock)}

            Now, generate the optimized delivery routes.`,
    });

    return result;
  } catch (error) {
    console.error("Error generating routes:", error);
    return null;
  }
};
