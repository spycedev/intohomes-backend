import dotenv from "dotenv";

import { GeoJSONPolygon } from "../types/types";
import axios from "axios";

import { SearchResponse } from "@repliers.io/api-types/types/listings";

dotenv.config();

const REPLIERS_API_KEY = process.env.REPLIERS_API_KEY as string;
const REPLIERS_BASE_URL = process.env.REPLIERS_BASE_URL as string;

const repliersApi = axios.create({
  baseURL: REPLIERS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "REPLIERS-API-KEY": REPLIERS_API_KEY,
  },
});

const getListing = async ({ mlsNumber }: { mlsNumber: string }) => {
  const response = await repliersApi.get(`/listings/${mlsNumber}`);
  return response.data;
};

const searchListings = async ({
  map,
  coordinates,
  filters,
}: {
  map?: GeoJSONPolygon["coordinates"];
  coordinates?: {
    lat: number | undefined;
    lng: number | undefined;
    radius: number | undefined;
  };
  filters?: {
    areaOrCity?: string | undefined;
    propertyClass?: string[] | undefined;
    maxPrice?: number | undefined;
    minPrice?: number | undefined;
    city?: string | undefined;
    minBedrooms?: number | undefined;
    maxBedrooms?: number | undefined;
    minBaths?: number | undefined;
    maxBaths?: number | undefined;
    propertyType?: string | undefined;
    status?: ("active" | "unavailable") | undefined;
    minSqft?: number | undefined;
    maxSqft?: number | undefined;
    mlsNumbers?: string[] | undefined;
    streetNumber?: string | undefined;
    streetName?: string | undefined;
    zip?: string | undefined;
  };
}) => {
  try {
    const params: Record<string, any> = {};

    // Default to residential
    // params.class = "residential";

    if (map || filters?.areaOrCity) {
      params.map = JSON.stringify(map);
      params.areaOrCity = filters?.areaOrCity;
    }

    // params.streetName = "Skinner";

    if (
      coordinates &&
      coordinates.lat &&
      coordinates.lng &&
      coordinates.radius
    ) {
      params.lat = coordinates.lat;
      params.long = coordinates.lng;
      params.radius = coordinates.radius;
    }

    if (filters) {
      const {
        propertyClass,
        maxPrice,
        minPrice,
        city,
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
      } = filters;

      if (mlsNumbers && mlsNumbers.length > 0) {
        params.mlsNumber = [];
        mlsNumbers.forEach((mlsNumber) => {
          if (typeof mlsNumber === "string" && mlsNumber[0] === "R") {
            params.mlsNumber.push(mlsNumber);
          }
        });
      } else {
        if (propertyClass) params.class = propertyClass || "residential";
        if (typeof minPrice === "number" && minPrice > 0)
          params.minPrice = minPrice;
        if (typeof maxPrice === "number" && maxPrice > 0)
          params.maxPrice = maxPrice;
        if (typeof minBedrooms === "number") params.minBedrooms = minBedrooms;
        if (typeof maxBedrooms === "number") params.maxBedrooms = maxBedrooms;
        if (typeof minBaths === "number") params.minBaths = minBaths;
        if (typeof maxBaths === "number") params.maxBaths = maxBaths;
        if (propertyType) params.propertyType = propertyType;
        if (status)
          params.status =
            status === "active" ? "a" : status === "unavailable" ? "u" : null;
        if (typeof minSqft === "number") params.minSqft = minSqft;
        if (typeof maxSqft === "number") params.maxSqft = maxSqft;
        if (city) params.city = city;
        if (streetNumber) params.streetNumber = streetNumber;
        if (streetName) params.streetName = streetName;
        if (zip) params.zip = zip;
      }
    }

    const response = await repliersApi.get<SearchResponse>("/listings", {
      params,
    });

    return response.data as SearchResponse;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getSimilarListings = async ({ mlsNumber }: { mlsNumber: string }) => {
  const response = await repliersApi.get(`/listings/${mlsNumber}/similar`);
  return response.data;
};

export const REPLIERS_SERVICE = () => ({
  searchListings,
  getListing,
  getSimilarListings,
});
