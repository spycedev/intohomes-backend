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

const searchListings = async ({
  map,
  coordinates,
}: {
  map?: GeoJSONPolygon["coordinates"];
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;
  };
}) => {
  try {
    const params: any = {
      resultsPerPage: 1000,
    };

    if (map) {
      params.map = JSON.stringify(map);
    }

    if (coordinates) {
      params.lat = coordinates.lat;
      params.long = coordinates.lng;
      params.radius = coordinates.radius;
    }

    const response = await repliersApi.get<SearchResponse>("/listings", {
      params,
    });

    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const REPLIERS_SERVICE = () => ({
  searchListings,
});
