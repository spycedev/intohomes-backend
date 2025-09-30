import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "auth_token";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded: ", decoded);
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid session" });
    }

    const payload = decoded as jwt.JwtPayload;
    if (!payload?.userId || typeof payload.userId !== "string") {
      return res.status(401).json({ error: "Invalid session" });
    }

    req.user = { ...payload, userId: payload.userId };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid session" });
  }
}
