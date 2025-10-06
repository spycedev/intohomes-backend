import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { MailtrapClient } from "mailtrap";
dotenv.config();

const client = new MailtrapClient({ token: process.env.MAILERTRAP_API_KEY! });

console.log("Client", client);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const sender = {
      name: process.env.FROM_NAME!,
      email: process.env.FROM_EMAIL!,
    };
    return await client.send({
      to: [{ email: to }],
      from: sender,
      subject,
      html,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    return false;
  }
};

/**
 * Render an HTML email template by replacing {{placeholders}} with provided values.
 */
const renderTemplate = async (
  templateRelativePath: string,
  variables: Record<string, string>
): Promise<string> => {
  const templatePath = path.join(__dirname, templateRelativePath);
  const raw = await fs.promises.readFile(templatePath, "utf8");
  let output = raw;
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    output = output.replace(pattern, value);
  }
  return output;
};

/**
 * Send the IntoHomes magic-link login email using the branded template.
 */
export const sendLoginLinkEmail = async (
  to: string,
  params: { loginUrl: string; userEmail: string; expiresInMinutes: number }
) => {
  const { loginUrl, userEmail, expiresInMinutes } = params;
  const html = await renderTemplate("../templates/loginLinkEmail.html", {
    loginUrl,
    userEmail,
    expiresInMinutes: String(expiresInMinutes),
    year: String(new Date().getFullYear()),
  });

  const subject = "Your IntoHomes sign-in link";
  return sendEmail(to, subject, html);
};

/**
 * Send a mortgage inquiry email with the basic details.
 */
export const sendMortgageInquiryEmail = async (
  to: string,
  params: {
    name: string;
    email: string;
    phone: string;
    message: string;
    submittedAt?: string;
  }
) => {
  const { name, email, phone, message } = params;
  const submittedAt = params.submittedAt ?? new Date().toISOString();

  const html = await renderTemplate("../templates/mortgageInquiryEmail.html", {
    name,
    email,
    phone,
    message,
    submittedAt,
    year: String(new Date().getFullYear()),
  });

  const subject = `New Mortgage Inquiry from ${name}`;
  return sendEmail(to, subject, html);
};

export const sendGeneralInquiryEmail = async (
  to: string,
  params: {
    name: string;
    email: string;
    phone: string;
    message: string;
    preferredContact: string;
    submittedAt?: string;
  }
) => {
  const { name, email, phone, message, preferredContact } = params;
  const submittedAt = params.submittedAt ?? new Date().toISOString();

  const html = await renderTemplate("../templates/generalInquiryEmail.html", {
    name,
    email,
    phone,
    message,
    preferredContact,
    submittedAt,
    year: String(new Date().getFullYear()),
  });

  const subject = `New General Inquiry from ${name}`;
  return sendEmail(to, subject, html);
};

export const EMAIL_SERVICE = () => ({
  sendEmail,
  sendLoginLinkEmail,
  sendMortgageInquiryEmail,
  sendGeneralInquiryEmail,
});
