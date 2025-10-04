import { Router } from "express";
import { z, ZodError } from "zod";
import { PLIVO_SERVICE } from "../../services/plivo.service";
import { EMAIL_SERVICE } from "../../services/email.service";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { formatUpperCaseFirstLetterWord } from "../../helpers/formatText";

export const contactRoutes = Router();

const schema = z.object({
  name: z.string(),
  email: z.email("Invalid email address"),
  phone: z.string(),
  message: z.string(),
});

const plivoService = PLIVO_SERVICE();
const emailService = EMAIL_SERVICE();

contactRoutes.post("/mortgage-inquiry", async (req, res) => {
  try {
    console.log("Hello");
    const validatedData = schema.parse(req.body);

    const parsedPhone = parsePhoneNumberWithError(validatedData.phone, "US");

    const formattedPhone = parsedPhone.nationalNumber;

    const formattedName = formatUpperCaseFirstLetterWord(validatedData.name);

    plivoService.sendSms(
      process.env.MORTGAGE_INQUIRY_TO_PHONE || "+12506383302",
      `Mortgage inquiry from ${formattedName}: ${validatedData.message}, ${validatedData.email}, ${validatedData.phone}`
    );

    plivoService.sendSms(
      `+1${formattedPhone}`,
      `Hey ${formattedName}, we have received your mortgage inquiry! We will get back to you soon.`
    );

    // Send inquiry details via email to the team inbox
    const INQUIRY_TO =
      process.env.MORTGAGE_INQUIRY_TO || process.env.FROM_EMAIL || "";
    if (INQUIRY_TO) {
      await emailService.sendMortgageInquiryEmail(INQUIRY_TO, {
        name: formattedName,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        submittedAt: new Date().toISOString(),
      });
    }

    return res.json({ message: "success" });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ZodError) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "error" });
  }
});
