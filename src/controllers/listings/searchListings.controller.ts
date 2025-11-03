import { Request, Response } from "express";
import z, { number, object } from "zod";
import { GeoJSONPolygon, GeoJSONPolygonSchema } from "../../types/types";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import { SearchResponse } from "@repliers.io/api-types/types/listings";
import { AxiosError } from "axios";

const schema = z.object({
  map: GeoJSONPolygonSchema.optional(),
  coordinates: object({
    lat: number(),
    lng: number(),
    radius: number(),
  }).optional(),
  // Optional filters
  streetNumber: z.string().optional(),
  streetName: z.string().optional(),
  zip: z.string().optional(),
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  city: z.string().optional(),
  areaOrCity: z.string().optional(),
  minBedrooms: z.number().optional(),
  maxBedrooms: z.number().optional(),
  minBaths: z.number().optional(),
  maxBaths: z.number().optional(),
  propertyType: z.enum(["house", "condo", "townhouse"]).optional(),
  status: z.enum(["active", "unavailable"]).optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  propertyClass: z.string().optional(),
  mlsNumbers: z.array(z.string()).optional(),
  search: z.string().optional(),
});

export const searchListingsController = async (
  request: Request,
  response: Response
) => {
  try {
    const {
      map,
      coordinates,
      maxPrice,
      minPrice,
      city,
      areaOrCity,
      minBedrooms,
      maxBedrooms,
      minBaths,
      maxBaths,
      propertyType,
      status,
      minSqft,
      maxSqft,
      mlsNumbers,
      streetNumber,
      streetName,
      zip,
      propertyClass,
      search,
    } = schema.parse(request.body);

    let result: SearchResponse | undefined;

    const filters = {
      maxPrice,
      minPrice,
      city,
      areaOrCity,
      minBedrooms,
      maxBedrooms,
      minBaths,
      maxBaths,
      propertyType,
      status,
      minSqft,
      maxSqft,
      mlsNumbers,
      streetNumber,
      streetName,
      zip,
      propertyClass: propertyClass?.split(",").map((item) => item.trim()),
      search,
    };

    const coordinatesObj = {
      lat: coordinates?.lat,
      lng: coordinates?.lng,
      radius: coordinates?.radius,
    };

    result = (await REPLIERS_SERVICE().searchListings({
      map: map?.coordinates as GeoJSONPolygon["coordinates"],
      coordinates: coordinatesObj,
      filters,
    })) as SearchResponse;

    const data = {
      message: "success",
      result,
    };

    return response.send(data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    return response.status(400).json({ error: "Invalid request body" });
  }
};
