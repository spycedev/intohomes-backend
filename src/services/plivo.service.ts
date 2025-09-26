import { Client } from "plivo";

const client = new Client(
  process.env.PLIVO_AUTH_ID,
  process.env.PLIVO_AUTH_TOKEN
);

const sendSms = async (to: string, message: string) => {
  const response = await client.messages.create(
    process.env.PLIVO_FROM_NUMBER,
    to,
    message
  );
  return response;
};

export const PLIVO_SERVICE = () => ({
  sendSms,
});
