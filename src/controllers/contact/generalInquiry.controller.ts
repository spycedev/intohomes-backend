import { Request, Response } from "express";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { formatUpperCaseFirstLetterWord } from "../../helpers/formatText";
import { PLIVO_SERVICE } from "../../services/plivo.service";
import { z, ZodError } from "zod";
import { EMAIL_SERVICE } from "../../services/email.service";

const plivoService = PLIVO_SERVICE();

const emailService = EMAIL_SERVICE();

const schema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  message: z.string(),
  preferredContact: z.enum(["email", "phone", "sms"]),
});

export const generalInquiry = async (req: Request, res: Response) => {
  try {
    const validatedData = schema.parse(req.body);

    const parsedPhone = parsePhoneNumberWithError(validatedData.phone, "US");

    const formattedPhone = parsedPhone.nationalNumber;

    const formattedName = formatUpperCaseFirstLetterWord(validatedData.name);

    await plivoService.sendSms(
      process.env.MORTGAGE_INQUIRY_TO_PHONE || "+12506383302",
      formatInquiry({
        name: formattedName,
        message: validatedData.message,
        email: validatedData.email,
        phone: formattedPhone,
        preferredContact: validatedData.preferredContact,
      })
    );

    const emailResult = await emailService.sendGeneralInquiryEmail(
      process.env.MORTGAGE_INQUIRY_TO || "",
      {
        name: formattedName,
        email: validatedData.email,
        phone: formattedPhone,
        message: validatedData.message,
        preferredContact: validatedData.preferredContact,
        submittedAt: new Date().toISOString(),
      }
    );

    console.log(emailResult);

    if (!emailResult) {
      return res
        .status(500)
        .json({ message: "An error occurred while sending the email" });
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
    return res
      .status(500)
      .json({ message: "An error occurred while sending the email" });
  }
};

function formatInquiry({
  name,
  message,
  email,
  phone,
  preferredContact,
}: {
  name: string;
  message: string;
  email: string;
  phone: string;
  preferredContact: string;
}) {
  const parts = [
    `🏠 New Contact Inquiry`,
    `From: ${name || "Unknown"}`,
    ``,
    `📩 Message:`,
    `${message || "No message provided."}`,
    ``,
    `📞 Contact Info:`,
    `Email: ${email || "N/A"}`,
    `Phone: ${phone || "N/A"}`,
    `Preferred Contact: ${preferredContact || "N/A"}`,
  ];

  return parts.join("\n");
}
