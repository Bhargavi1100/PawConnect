import express from "express";
import cors from "cors";
import { placesRouter } from "./routes/places";
import { authRouter } from "./routes/auth";
import { prisma } from "./lib/prisma";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", async (_req, res) => {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    // API stays up (and reports) even when the database is unreachable.
  }
  res.json({ status: "ok", db });
});

app.use("/api/v1/places", placesRouter);
app.use("/api/v1/auth", authRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { message: "Not found" } });
});
