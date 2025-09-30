import type jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      // Populated by auth middleware after verifying the JWT
      user?: jwt.JwtPayload & { userId: string };
    }
  }
}

export {};
