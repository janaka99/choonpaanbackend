import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const GENERATE_ROUTES = async (
  startLocation: any,
  pastSales: any,
  currentStock: any
) => {
  try {
    // Step 1: Validate Input Parameters
    // Before starting the route generation process, we ensure that all required inputs are provided.
    // These inputs include:
    // - `startLocation`: The fixed starting point for all delivery routes.
    // - `pastSales`: Historical sales data to identify high-demand areas.
    // - `currentStock`: The current inventory available for delivery.
    // If any of these inputs are missing, the function throws an error to prevent incorrect processing.
    if (!startLocation || !pastSales || !currentStock) {
      throw new Error(
        "Missing required parameters: startLocation, pastSales, or currentStock"
      );
    }

    // Step 2: Generate Optimized Delivery Routes
    // Here, we use an AI model to create 3 optimized delivery routes for the Choon Paan (mobile bakery) driver.
    // The AI model considers the following business factors:
    // - Past sales trends to identify areas with high demand.
    // - Current stock availability to ensure the driver carries the right items.
    // - Efficiency in covering different areas without unnecessary overlaps.
    const result = await generateObject({
      // Step 2.1: Configure the AI Model
      // We use OpenAI's GPT-4 model with structured output capabilities to ensure the generated routes are well-organized.
      model: openai("gpt-4o-2024-08-06", {
        structuredOutputs: true,
      }),

      // Step 2.2: Define the Schema for the Output
      // The schema specifies the structure of the output we expect from the AI.
      // It includes:
      // - `routes`: An array of 3 delivery routes.
      // - Each route contains:
      //   - `road`: A list of stop points with latitude and longitude coordinates.
      //   - `demandItems`: A list of items with their demand levels (HIGH, MEDIUM, LOW).
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

      // Step 2.3: Provide the Prompt for the AI
      // The prompt explains the business requirements and optimization strategy to the AI.
      // It includes:
      // - A fixed starting location for all routes.
      // - The need to generate exactly 3 unique routes, each ending in a different area.
      // - Prioritization of high-demand areas based on past sales data.
      // - Balancing demand across routes to ensure efficient delivery.
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
    // Step 3: Return the Generated Routes
    // Once the AI generates the routes, we return the result to the caller.
    // This result contains the 3 optimized routes with detailed stop points and demand items.
    // console.log(JSON.stringify(result?.object.routes, null, 2));
    return result;
  } catch (error) {
    console.log(error)
    // Step 4: Handle Errors
    // If any error occurs during the process (e.g., missing inputs or AI model issues),
    // we log the error for debugging and return `null` to indicate failure.
    console.error("Error generating routes:", error);
    return null;
  }
};
