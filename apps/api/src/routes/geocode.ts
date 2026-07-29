import { Router } from "express";
import { GeocodeQuerySchema, type GeocodeResult } from "@pawconnect/shared";

export const geocodeRouter = Router();

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

type GoogleGeocodeResponse = {
  status?: string;
  results?: Array<{
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
};

/** First usable result from a Google Geocoding response, or null. */
export function parseGeocodeResponse(data: GoogleGeocodeResponse): GeocodeResult | null {
  const first = data.results?.[0];
  const lat = first?.geometry?.location?.lat;
  const lng = first?.geometry?.location?.lng;
  if (lat == null || lng == null) return null;
  return { lat, lng, formattedAddress: first?.formatted_address ?? "" };
}

/**
 * GET /api/v1/geocode?q=<city, ZIP/PIN code, or address>
 *
 * Server-side Google Geocoding so the billing key never ships to clients.
 * Powers manual location entry when device geolocation is denied.
 */
geocodeRouter.get("/", async (req, res) => {
  const parsed = GeocodeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: { message: "Invalid query parameters", issues: parsed.error.issues },
    });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: { message: "Location search is not configured on this server" },
    });
    return;
  }

  try {
    const url = `${GEOCODE_URL}?address=${encodeURIComponent(parsed.data.q)}&key=${apiKey}`;
    const googleRes = await fetch(url);
    if (!googleRes.ok) {
      res.status(502).json({ error: { message: "Location search failed, try again" } });
      return;
    }
    const data = (await googleRes.json()) as GoogleGeocodeResponse;
    if (data.status === "ZERO_RESULTS") {
      res.status(404).json({ error: { message: "No matching location found" } });
      return;
    }
    const result = data.status === "OK" ? parseGeocodeResponse(data) : null;
    if (!result) {
      res.status(502).json({ error: { message: "Location search failed, try again" } });
      return;
    }
    res.json(result);
  } catch {
    res.status(502).json({ error: { message: "Location search failed, try again" } });
  }
});
