import { format } from "date-fns";

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

export default formatOfferMessage;
