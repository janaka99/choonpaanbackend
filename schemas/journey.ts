import { z } from "zod";

export const JourneySchema = z.object({
  route: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    })
  ),
  orderInsights: z.union([
    z.null(), // Allows null
    z
      .array(
        z.object({
          demandStatus: z.string().min(1),
          itemName: z.string().min(1),
        })
      )
      .optional(), // Allows empty array or missing field
  ]),
});
