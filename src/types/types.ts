import z from "zod";

export const GeoJSONPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(
    z.array(
      z.tuple([z.number(), z.number()]) // [lng, lat]
    )
  ),
});

export type GeoJSONPolygon = z.infer<typeof GeoJSONPolygonSchema>;
