import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: true, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      to,
      from: process.env.FROM_EMAIL,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const EMAIL_SERVICE = () => ({
  sendEmail,
});
