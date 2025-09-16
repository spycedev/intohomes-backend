import { Request, Response } from "express";
import z, { number, object } from "zod";
import { GeoJSONPolygon, GeoJSONPolygonSchema } from "../../types/types";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import { Listings } from "@repliers.io/api-types";
import { SearchResponse } from "@repliers.io/api-types/types/listings";

const schema = z.object({
  map: GeoJSONPolygonSchema.optional(),
  coordinates: object({
    lat: number(),
    lng: number(),
    radius: number(),
  }).optional(),
});

export const searchListingsController = async (
  request: Request,
  response: Response
) => {
  try {
    const { map, coordinates } = schema.parse(request.body);

    let result: SearchResponse | undefined;

    if (!map && !coordinates) {
      return response.status(400).json({ error: "Missing map or coordinates" });
    }

    if (map) {
      result = (await REPLIERS_SERVICE().searchListings({
        map: map?.coordinates as GeoJSONPolygon["coordinates"],
      })) as SearchResponse;
    }

    if (coordinates) {
      result = (await REPLIERS_SERVICE().searchListings({
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          radius: coordinates.radius,
        },
      })) as SearchResponse;
    }

    // result?.listings.map((listing) => {
    //   console.log(listing.agents);
    //   console.log(listing.office);
    //   return listing;
    // });

    return response.status(200).json({ message: "success", result });
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
    return response.status(400).json({ error: "Invalid request body" });
  }
};
