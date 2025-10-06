import { Request, Response } from "express";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import { AxiosError } from "axios";

export const getListingController = async (
  request: Request,
  response: Response
) => {
  try {
    const { mlsNumber } = request.params;

    console.log("Fetching listing with mlsNumber", mlsNumber);

    const result = await REPLIERS_SERVICE().getListing({
      mlsNumber: mlsNumber as string,
    });

    return response.json({ result });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    return response.status(400).json({ error: "Invalid request body" });
  }
};
