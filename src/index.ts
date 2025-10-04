/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";
import searchListingsRoutes from "./routes/listings/searchListings.routes";

import cors from "cors";
import offersRoutes from "./routes/offers/offers.routes";
import authRoutes from "./routes/auth/auth.routes";

import cookieParser from "cookie-parser";
import { connectDb } from "./db";

import meRoutes from "./routes/me/me.routes";
import { contactRoutes } from "./routes/contact/contact.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.CORS_ORIGINS?.split(",")
          .map((origin) => origin.trim())
          .includes(origin!)
      ) {
        callback(null, true);
      } else {
        console.log("Origin not allowed by CORS", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options(/.*/, cors());

connectDb();

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/contact", contactRoutes);

app.use("/api/listings", searchListingsRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/me", meRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
