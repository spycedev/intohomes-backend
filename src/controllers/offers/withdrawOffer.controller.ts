import { Request, Response } from "express";
import Offer from "../../models/Offer";

export const withdrawOffer = async (req: Request, res: Response) => {
  try {
    const offerId = req.params.offerId;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.status === "WITHDRAWN") {
      return res.status(400).json({ message: "Offer already withdrawn" });
    }

    offer.status = "WITHDRAWN";
    offer.updatedAt = new Date();

    await offer.save();
    return res.status(200).json({ message: "Offer withdrawn" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
