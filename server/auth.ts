import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "erroren-x-jwt-super-secret-key-2026";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user";
    plan: "Free" | "Pro" | "Business";
  };
}

export function generateToken(payload: { id: string; email: string; role: string; plan: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: "admin" | "user"; plan: "Free" | "Pro" | "Business" };
    const user = getUserById(decoded.id);
    if (!user || user.isBanned) {
      return res.status(401).json({ error: "User account invalid or suspended" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: "admin" | "user"; plan: "Free" | "Pro" | "Business" };
      const user = getUserById(decoded.id);
      if (user && !user.isBanned) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan
        };
      }
    } catch {
      // ignore optional auth errors
    }
  }
  next();
}

export function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator privileges required" });
  }
  next();
}
