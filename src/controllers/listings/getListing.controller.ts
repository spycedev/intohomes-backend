import { Request, Response } from "express";
import { REPLIERS_SERVICE } from "../../services/repliers.service";

export const getListingController = async (
  request: Request,
  response: Response
) => {
  const { mlsNumber } = request.params;

  console.log("Fetching listing with mlsNumber", mlsNumber);

  const result = await REPLIERS_SERVICE().getListing({
    mlsNumber: mlsNumber as string,
  });

  return response.json({ result });
};
