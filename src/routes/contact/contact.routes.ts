import { Router } from "express";
import { z } from "zod";
import { PLIVO_SERVICE } from "../../services/plivo.service";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { formatUpperCaseFirstLetterWord } from "../../helpers/formatText";

export const contactRoutes = Router();

const schema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
});

contactRoutes.post("/mortgage-inquiry", async (req, res) => {
  try {
    console.log("Hello");
    const validatedData = schema.parse(req.body);

    const parsedPhone = parsePhoneNumberWithError(validatedData.phone, "US");

    const formattedPhone = parsedPhone.nationalNumber;

    const plivoService = PLIVO_SERVICE();

    const formattedName = formatUpperCaseFirstLetterWord(validatedData.name);

    plivoService.sendSms(
      "+12506383302",
      `Morgage inquiry from ${formattedName}: ${validatedData.message}, ${validatedData.email}, ${validatedData.phone}`
    );

    plivoService.sendSms(
      `+1${formattedPhone}`,
      `Hey ${formattedName}, we have received your mortgage inquiry! We will get back to you soon.`
    );

    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "error" });
  }
});
