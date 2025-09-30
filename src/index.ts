/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";
import searchListingsRoutes from "./routes/listings/searchListings.routes";

import cors from "cors";
import offersRoutes from "./routes/offers/offers.routes";
import authRoutes from "./routes/auth/auth.routes";

import cookieParser from "cookie-parser";
import { connectDb } from "./db";
import { authRequired } from "./helpers/auth";
import User from "./models/User";
import meRoutes from "./routes/me/me.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend domain
    credentials: true, // allow cookies to be sent
  })
);

connectDb();

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/listings", searchListingsRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/me", meRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
