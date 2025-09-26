import { Router } from "express";
import { PLIVO_SERVICE } from "../../services/plivo.service";
import { format } from "date-fns";
import { REPLIERS_SERVICE } from "../../services/repliers.service";

const router = Router();

const plivoService = PLIVO_SERVICE();

function formatOfferMessage(
  offer: any,
  mlsNumber: string,
  listingAddress: string
) {
  const amount = offer.amount.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });

  const possessionDate = format(new Date(offer.possessionDate), "yyyy-MM-dd");

  const subjects =
    offer.subjects && offer.subjects.length > 0
      ? offer.subjects.join(", ")
      : "None";

  const buyerNames = offer.buyers
    .map(
      (b: { firstName: string; lastName: string }) =>
        `${b.firstName} ${b.lastName}`
    )
    .join(", ");

  return (
    `Offer Details\n` +
    `MLS Number: ${mlsNumber}\n` +
    `Address: ${listingAddress}\n` +
    `💵 Amount: ${amount}\n` +
    `📅 Possession Date: ${possessionDate}\n` +
    `📝 Subjects: ${subjects}\n` +
    `👤 Buyer: ${buyerNames}\n` +
    `📨 Contact: ${offer.contactInfo.name} | ${offer.contactInfo.email} | ${offer.contactInfo.phone}\n` +
    `✅ Terms Accepted`
  );
}

router.post("/create", async (req, res) => {
  console.log(req.body);
  const mlsNumber = req.body.mlsNumber;

  const listing = await REPLIERS_SERVICE().getListing({ mlsNumber });

  const listingAddress = `${listing.address.streetNumber} ${listing.address.streetName}`;

  const messageText = formatOfferMessage(req.body, mlsNumber, listingAddress);

  console.log(messageText);

  plivoService.sendSms("+12506383302", messageText);

  return res.json({ message: "success" });
});

export default router;
