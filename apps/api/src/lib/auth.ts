import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";

export type TokenPayload = { sub: string; email: string };

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  return decoded as TokenPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/** Express middleware requiring a valid `Authorization: Bearer <accessToken>`. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: { message: "Missing access token" } });
    return;
  }
  try {
    req.user = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
    next();
  } catch {
    res.status(401).json({ error: { message: "Invalid or expired access token" } });
  }
}
