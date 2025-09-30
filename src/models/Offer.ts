import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const listingSchema = new mongoose.Schema({
  mlsNumber: { type: String, required: true },
  streetNumber: { type: String, required: true },
  streetName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  listingPrice: { type: Number, required: true },
});

const offerSchema = new mongoose.Schema({
  mlsNumber: { type: String, required: true },
  listing: { type: listingSchema, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "RECEIVED",
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
      "COMPLETED",
      "LOST",
    ],
    default: "RECEIVED",
  },
  subjects: { type: [String], required: true },
  possessionDate: { type: Date, required: true },
  buyers: { type: [buyerSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
