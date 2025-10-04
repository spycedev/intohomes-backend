import { Router, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../../models/User";
import { EMAIL_SERVICE } from "../../services/email.service";

const router = Router();

const emailService = EMAIL_SERVICE();

router.delete("/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("auth_token");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/verify", (req: Request, res: Response) => {
  try {
    const rawToken = req.query?.token;

    if (typeof rawToken !== "string" || rawToken.trim().length === 0) {
      return res.status(400).json({ message: "Token is required" });
    }

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: JWT_SECRET is missing" });
    }

    const decoded = jwt.verify(rawToken, JWT_SECRET) as jwt.JwtPayload;
    const userId = decoded?.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const authToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // require HTTPS in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.redirect("http://localhost:5173");
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});

router.post("/request-login", async (req: Request, res: Response) => {
  try {
    const emailRaw = req.body?.email;
    if (typeof emailRaw !== "string" || emailRaw.trim().length === 0) {
      return res.status(400).json({ message: "Email is required" });
    }
    const email = emailRaw.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");

      return res.status(400).json({ message: "User not found" });
    }

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: JWT_SECRET is missing" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "10m",
    });

    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

    await emailService.sendLoginLinkEmail(user.email, {
      loginUrl: `${BACKEND_URL}/api/auth/verify?token=${token}`,
      userEmail: user.email,
      expiresInMinutes: 10,
    });

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
