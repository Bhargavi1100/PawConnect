import { Router } from "express";
import bcrypt from "bcryptjs";
import { LoginSchema, RefreshSchema, RegisterSchema } from "@pawconnect/shared";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/auth";

export const authRouter = Router();

function authResponse(user: { id: string; email: string; name: string }) {
  const payload = { sub: user.id, email: user.email };
  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

authRouter.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { message: "Invalid input", issues: parsed.error.issues } });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: { message: "An account with this email already exists" } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  res.status(201).json(authResponse(user));
});

authRouter.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { message: "Invalid input", issues: parsed.error.issues } });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: { message: "Invalid email or password" } });
    return;
  }
  res.json(authResponse(user));
});

authRouter.post("/refresh", (req, res) => {
  const parsed = RefreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { message: "Invalid input", issues: parsed.error.issues } });
    return;
  }
  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    res.json({ accessToken: signAccessToken({ sub: payload.sub, email: payload.email }) });
  } catch {
    res.status(401).json({ error: { message: "Invalid or expired refresh token" } });
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    res.status(404).json({ error: { message: "User not found" } });
    return;
  }
  res.json({ id: user.id, email: user.email, name: user.name });
});
