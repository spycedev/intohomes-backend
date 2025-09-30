import Offer from "../../models/Offer";
import { Request, Response } from "express";

export const getOffers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    console.log("User ID: ", userId);
    const offers = await Offer.find({ userId });

    console.log(offers);
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
