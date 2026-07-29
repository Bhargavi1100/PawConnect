import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { parseGeocodeResponse } from "./geocode";

describe("parseGeocodeResponse", () => {
  it("extracts the first result", () => {
    expect(
      parseGeocodeResponse({
        status: "OK",
        results: [
          {
            formatted_address: "Bengaluru, Karnataka, India",
            geometry: { location: { lat: 12.9716, lng: 77.5946 } },
          },
        ],
      }),
    ).toEqual({ lat: 12.9716, lng: 77.5946, formattedAddress: "Bengaluru, Karnataka, India" });
  });

  it("returns null when coordinates are missing", () => {
    expect(parseGeocodeResponse({ status: "OK", results: [{}] })).toBeNull();
    expect(parseGeocodeResponse({})).toBeNull();
  });
});

describe("GET /api/v1/geocode", () => {
  const savedKey = process.env.GOOGLE_MAPS_API_KEY;

  beforeEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });
  afterEach(() => {
    if (savedKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = savedKey;
  });

  it("rejects a too-short query", async () => {
    const res = await request(app).get("/api/v1/geocode?q=a");
    expect(res.status).toBe(400);
  });

  it("returns 503 when no API key is configured", async () => {
    const res = await request(app).get("/api/v1/geocode?q=Bengaluru");
    expect(res.status).toBe(503);
    expect(res.body.error.message).toMatch(/not configured/);
  });
});
