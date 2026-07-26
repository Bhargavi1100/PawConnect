import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./app";

// These tests run without a database: health degrades gracefully and the
// nearby endpoint's validation rejects bad input before any DB access.
describe("GET /api/v1/health", () => {
  it("responds ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/v1/places/nearby", () => {
  it("rejects missing coordinates", async () => {
    const res = await request(app).get("/api/v1/places/nearby");
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Invalid query parameters");
  });

  it("rejects out-of-range latitude", async () => {
    const res = await request(app).get("/api/v1/places/nearby?lat=123&lng=0");
    expect(res.status).toBe(400);
  });
});
