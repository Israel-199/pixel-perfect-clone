import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "rabbi_church_secret_key_2026";

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  let token = authHeader
    ? (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader)
    : undefined;

  if (!token && req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"] as string;
  }

  if (!token && req.query?.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
    return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Access denied. Admin role required." });
    return;
  }
  next();
};
