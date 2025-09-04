import { Request, Response } from "express";
import z from "zod";
import { GeoJSONPolygon, GeoJSONPolygonSchema } from "../../types/types";
import { REPLIERS_SERVICE } from "../../services/repliers.service";

const schema = z.object({
  map: GeoJSONPolygonSchema.optional(),
});

export const searchListingsController = async (
  request: Request,
  response: Response
) => {
  try {
    const { map } = schema.parse(request.body);

    console.log("Coordinates", map?.coordinates);

    const result = await REPLIERS_SERVICE().searchListings({
      map: map?.coordinates as GeoJSONPolygon["coordinates"],
    });

    return response.status(200).json(result);
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
    return response.status(400).json({ error: "Invalid request body" });
  }
};
