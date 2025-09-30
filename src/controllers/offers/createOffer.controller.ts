import formatOfferMessage from "../../helpers/formatText";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import { PLIVO_SERVICE } from "../../services/plivo.service";
import { Request, Response } from "express";
import { z } from "zod";
import User from "../../models/User";
import Offer from "../../models/Offer";
const plivoService = PLIVO_SERVICE();

const schema = z.object({
  mlsNumber: z.string(),
  amount: z.number(),
  possessionDate: z.coerce.date(),
  subjects: z.array(z.string()),
  buyers: z.array(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
    })
  ),
  contactInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
});

export const createOffer = async (req: Request, res: Response) => {
  try {
    const validatedData = await schema.parseAsync(req.body);

    const { contactInfo } = validatedData;

    const mlsNumber = validatedData?.mlsNumber;

    const listing = await REPLIERS_SERVICE().getListing({ mlsNumber });

    const listingAddress = `${listing.address?.streetNumber} ${listing.address?.streetName}`;

    const messageText = formatOfferMessage(req.body, mlsNumber, listingAddress);

    // Check if user already exists with email
    let user = await User.findOne({ email: contactInfo.email, role: "CLIENT" });

    if (!user) {
      user = await User.create({
        email: contactInfo.email,
        name: contactInfo.name,
        phone: contactInfo.phone,
        role: "CLIENT",
      });
    }

    // Insert the offer
    const offerCreated = await Offer.create({
      mlsNumber: validatedData?.mlsNumber,
      listing: {
        mlsNumber: validatedData?.mlsNumber,
        streetNumber: listing.address?.streetNumber,
        streetName: listing.address?.streetName,
        city: listing.address?.city,
        state: listing.address?.state,
        zipCode: listing.address?.zip,
        listingPrice: listing.listPrice,
      },
      amount: validatedData?.amount,
      possessionDate: validatedData?.possessionDate,
      subjects: validatedData?.subjects,
      buyers: validatedData?.buyers,
      userId: user._id,
    });

    if (!offerCreated) {
      return res.status(500).json({ message: "error" });
    }

    plivoService.sendSms("+12506383302", messageText);
    plivoService.sendSms(
      user.phone || contactInfo.phone,
      `Hey ${contactInfo.name}, we have received your offer for ${mlsNumber}! A realtor will get back to you soon.`
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "error" });
  }
};
