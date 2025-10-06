import { Request, Response } from "express";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import { AxiosError } from "axios";

export const getSimilarListingsController = async (
  request: Request,
  response: Response
) => {
  try {
    const { mlsNumber } = request.params;

    const result = await REPLIERS_SERVICE().getSimilarListings({
      mlsNumber: mlsNumber as string,
    });

    return response.json({ result });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    console.log(error);
    return response.status(400).json({ error: "Invalid request body" });
  }
};
