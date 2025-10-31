import { Request, Response } from "express";
import { REPLIERS_SERVICE } from "../../services/repliers.service";
import axios, { AxiosError } from "axios";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import dotenv from "dotenv";
import {
  calculateMortgage,
  calculateMultipleMortgages,
} from "../../helpers/mortgageCalc";

dotenv.config();

const types = ["address", "mortgageOption1", "mortgageOption2", "contact"];

export const imagesController = async (req: Request, res: Response) => {
  try {
    const { mlsNumber } = req.params;
    const { imageId = 0, type = "address" } = req.query as {
      imageId: string;
      type: string;
    };

    if (!mlsNumber) {
      return res.status(400).json({ message: "MLS number is required" });
    }

    const listing = await REPLIERS_SERVICE().getListing({ mlsNumber });

    console.log("listing", listing);
    const image = listing.images?.[Number(imageId)];
    if (!image) return res.status(404).json({ message: "Image not found" });

    // --- Fetch remote image ---
    const imageUrl = `${process.env.REPLIERS_IMG_URL}${image}`;
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const baseImage = await loadImage(Buffer.from(response.data, "binary"));

    // --- Canvas Setup (Square 1080x1080) ---
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // --- Background ---
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // --- Draw main listing image (cover entire canvas like background-image: cover) ---
    const canvasRatio = width / height;
    const imgRatio = baseImage.width / baseImage.height;

    let sx = 0;
    let sy = 0;
    let sWidth = baseImage.width;
    let sHeight = baseImage.height;

    // Crop horizontally or vertically to fit without white space
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas → crop sides
      sWidth = baseImage.height * canvasRatio;
      sx = (baseImage.width - sWidth) / 2;
    } else if (imgRatio < canvasRatio) {
      // Image is taller → crop top and bottom
      sHeight = baseImage.width / canvasRatio;
      sy = (baseImage.height - sHeight) / 2;
    }

    // Draw cropped image to fill full canvas
    ctx.drawImage(baseImage, sx, sy, sWidth, sHeight, 0, 0, width, height);

    // --- Footer bar ---
    const footerHeight = 260;
    ctx.fillStyle = "#001f3f";
    ctx.fillRect(0, height - footerHeight, width, footerHeight);

    // --- Logo Rectangle ---
    ctx.fillStyle = "#001f3f";
    ctx.fillRect(25, 25, 210, 190);

    // --- Add IntoHomes logo ---
    try {
      const logo = await loadImage(
        path.join(process.cwd(), "src/images/hl-gold.png")
      );
      const logoWidth = 193;
      const logoHeight = 172;
      const logoX = 30;
      const logoY = 30;
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    } catch {
      console.warn("Logo not loaded, skipping...");
    }

    if (type === "address") {
      // --- Text content ---
      const price = listing.listPrice
        ? `$${Number(listing.listPrice).toLocaleString()}`
        : "";
      const address =
        listing.address?.streetNumber +
          " " +
          listing.address?.streetName +
          ", " +
          listing.address?.city || "Property Listing";

      const specs = [
        listing.details?.numBedrooms && `${listing.details?.numBedrooms} Beds`,
        listing.details?.numBathrooms &&
          `${listing.details?.numBathrooms} Baths`,
      ]
        .filter(Boolean)
        .join(" • ");

      // --- Address ---
      ctx.font = "bold 46px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(address, 60, height - footerHeight + 85);

      // --- Price ---
      ctx.font = "bold 42px Inter";
      ctx.fillStyle = "#facc15";
      ctx.fillText(price, 60, height - footerHeight + 155);

      // --- Specs ---
      ctx.font = "30px Inter";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(specs, 60, height - footerHeight + 210);
    } else if (type === "mortgageOption1") {
      // --- Header ---
      ctx.font = "bold 28px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const headerY = height - footerHeight + 80;
      ctx.fillText("Mortgage Estimate (30-Years)", 60, headerY);

      // --- Calculate mortgage ---
      const mortgage = calculateMortgage({
        price: Number(listing.listPrice),
        downPaymentPercent: 5,
        interestRate: 4.3,
        years: [30],
        propertyClass: listing.class!,
        propertyType: listing.details?.propertyType!,
        isFirstTimeHomeBuyer: true,
      });

      const { requiredDownPayment, actualDownPaymentPercent, terms } =
        mortgage || {};

      const { monthly, biWeekly } = terms?.[0] || {};

      const downPaymentText = `${(
        actualDownPaymentPercent! / 100
      )?.toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
      })} Down ($${requiredDownPayment?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })})`;
      const monthlyText = `Est. Monthly: $${monthly?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}`;
      const biWeeklyText = `Bi-Weekly: $${biWeekly?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}`;

      // --- Position texts under the header ---
      let yOffset = headerY + 50; // space below the header

      ctx.font = "bold 26px Inter";
      ctx.fillStyle = "#facc15";
      ctx.fillText(downPaymentText, 60, yOffset);

      yOffset += 40;
      ctx.font = "24px Inter";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(monthlyText, 60, yOffset);

      yOffset += 35;
      ctx.fillText(biWeeklyText, 60, yOffset);
    } else if (type === "mortgageOption2") {
      // --- Header ---
      ctx.font = "bold 28px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const headerY = height - footerHeight + 80;
      ctx.fillText("Mortgage Estimate (30-Years)", 60, headerY);

      // --- Calculate mortgage ---
      const mortgage = calculateMortgage({
        price: Number(listing.listPrice),
        downPaymentPercent: 20,
        interestRate: 4.3,
        years: [25],
        propertyClass: listing.class!,
        propertyType: listing.details?.propertyType!,
        isFirstTimeHomeBuyer: true,
      });

      const {
        requiredDownPayment,
        downPayment,
        actualDownPaymentPercent,
        terms,
      } = mortgage || {};

      const { monthly, biWeekly } = terms?.[0] || {};

      const downPaymentText = `${(
        actualDownPaymentPercent! / 100
      )?.toLocaleString("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
      })} Down ($${downPayment?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })})`;
      const monthlyText = `Est. Monthly: $${monthly?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}`;
      const biWeeklyText = `Bi-Weekly: $${biWeekly?.toLocaleString("en-US", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      })}`;

      // --- Position texts under the header ---
      let yOffset = headerY + 50; // space below the header

      ctx.font = "bold 26px Inter";
      ctx.fillStyle = "#facc15";
      ctx.fillText(downPaymentText, 60, yOffset);

      yOffset += 40;
      ctx.font = "24px Inter";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(monthlyText, 60, yOffset);

      yOffset += 35;
      ctx.fillText(biWeeklyText, 60, yOffset);
    } else if (type === "contact") {
      // --- Header ---
      ctx.font = "bold 28px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      const headerY = height - footerHeight + 80;
      ctx.fillText("Contact Adam", 60, headerY);

      // --- Adam's Contact info ---
      ctx.font = "bold 26px Inter";
      ctx.fillStyle = "#facc15";
      ctx.fillText("Adam Coultish", 60, headerY + 40);

      ctx.font = "20px Inter";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText("15 Years of Experience", 60, headerY + 65);

      ctx.font = "24px Inter";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("(250) 631-3302", 60, headerY + 110);

      ctx.font = "24px Inter";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText("adam@intohomes.ca", 60, headerY + 140);
    }

    // --- Border (rounded corners look cleaner) ---
    ctx.strokeStyle = "#001f3f";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // --- Adam's Image ---
    try {
      const adam = await loadImage(
        path.join(process.cwd(), "src/images/adam.png")
      );
      const adamWidth = 470;
      const adamHeight = 531;

      ctx.drawImage(
        adam,
        width - adamWidth,
        height - adamHeight,
        adamWidth,
        adamHeight
      );
    } catch {
      console.warn("Adam not loaded, skipping...");
    }

    // --- Return buffer ---
    const buffer = canvas.toBuffer("image/png");
    res.set("Content-Type", "image/png");
    res.set("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Axios error:", error?.response?.data || error.message);
    } else {
      console.error("Error:", error);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
