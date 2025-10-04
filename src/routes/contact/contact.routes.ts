import { Router } from "express";
import { z, ZodError } from "zod";
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
      `Mortgage inquiry from ${formattedName}: ${validatedData.message}, ${validatedData.email}, ${validatedData.phone}`
    );

    plivoService.sendSms(
      `+1${formattedPhone}`,
      `Hey ${formattedName}, we have received your mortgage inquiry! We will get back to you soon.`
    );

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
