import { z } from "zod";
export const JourneySchema = z.object({
  route: 
    z.array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    ).nullable().optional(),
  
  orderInsights:z.array(
        z.object({
          demandStatus: z.string().min(1),
          itemName: z.string().min(1),
        })
      )
      .optional().nullable(), // Allows empty array or missing field

});
