import { Request, Response } from "express";
import { REPLIERS_SERVICE } from "../../services/repliers.service";

export const getSimilarListingsController = async (
  request: Request,
  response: Response
) => {
  try {
    const { mlsNumber } = request.params;

    console.log("Fetching similar listings with mlsNumber");
    const result = await REPLIERS_SERVICE().getSimilarListings({
      mlsNumber: mlsNumber as string,
    });

    console.log("Result fetched", JSON.stringify(result));
    return response.json({ result });
  } catch (error) {
    console.log(error);
    return response.status(400).json({ error: "Invalid request body" });
  }
};
