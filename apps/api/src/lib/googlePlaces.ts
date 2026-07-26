import type { PlaceType } from "@pawconnect/shared";
import { prisma } from "./prisma";

/**
 * Google Places enrichment (docs/ARCHITECTURE.md "Places data strategy").
 *
 * When GOOGLE_MAPS_API_KEY is set, nearby searches pull results from the
 * Places API (New) and upsert them into our Place table keyed by
 * googlePlaceId, so the PostGIS query serves a unified, distance-ordered
 * result set. An EnrichmentArea row per map cell (rounded lat/lng grid +
 * type) skips Google for areas enriched within the last 7 days.
 */

const SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.regularOpeningHours",
].join(",");

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// searchNearby rejects radii above 50 km.
const MAX_GOOGLE_RADIUS_M = 50_000;
// ~0.1° cells ≈ 11 km N-S; coarse enough to dedupe nearby searches.
const CELL_DEGREES = 0.1;

export type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    periods?: Array<{
      open?: { day?: number; hour?: number; minute?: number };
      close?: unknown;
    }>;
  };
};

export type MappedPlace = {
  googlePlaceId: string;
  type: PlaceType;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string | null;
  website: string | null;
  isEmergency: boolean;
  is24Hours: boolean;
};

export function isEnrichmentConfigured(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}

/** Google encodes 24/7 as a single Sunday-00:00 open period with no close. */
export function detectAlwaysOpen(hours: GooglePlace["regularOpeningHours"]): boolean {
  const periods = hours?.periods;
  if (!periods || periods.length !== 1) return false;
  const { open, close } = periods[0];
  return open?.day === 0 && open?.hour === 0 && (open?.minute ?? 0) === 0 && close == null;
}

/**
 * Convert a Google place into a Place row, or null if required fields are
 * missing. Vet results are split into hospital/clinic — and flagged as
 * emergency-capable — by name heuristics until admin verification (Phase 1)
 * curates them.
 */
export function mapGooglePlace(place: GooglePlace, kind: "VET" | "SHELTER"): MappedPlace | null {
  const name = place.displayName?.text;
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (!place.id || !name || lat == null || lng == null) return null;

  const lower = name.toLowerCase();
  const is24Hours = detectAlwaysOpen(place.regularOpeningHours);
  const type: PlaceType =
    kind === "SHELTER"
      ? "SHELTER"
      : lower.includes("hospital") || lower.includes("emergency")
        ? "VET_HOSPITAL"
        : "VET_CLINIC";

  return {
    googlePlaceId: place.id,
    type,
    name,
    lat,
    lng,
    address: place.formattedAddress ?? "",
    phone: place.internationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    isEmergency: kind === "VET" && (lower.includes("emergency") || is24Hours),
    is24Hours,
  };
}

function cellKey(lat: number, lng: number, type: PlaceType | undefined): string {
  const cellLat = Math.floor(lat / CELL_DEGREES) * CELL_DEGREES;
  const cellLng = Math.floor(lng / CELL_DEGREES) * CELL_DEGREES;
  return `${type ?? "ALL"}:${cellLat.toFixed(1)}:${cellLng.toFixed(1)}`;
}

async function fetchGooglePlaces(
  url: string,
  body: Record<string, unknown>,
  apiKey: string,
): Promise<GooglePlace[]> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Google Places request failed with status ${res.status}`);
  }
  const data = (await res.json()) as { places?: GooglePlace[] };
  return data.places ?? [];
}

async function upsertPlace(m: MappedPlace): Promise<void> {
  // Raw SQL for the PostGIS location column. Verified (curated) rows are
  // never overwritten by Google data.
  await prisma.$executeRaw`
    INSERT INTO "Place"
      ("id", "type", "name", "location", "address", "phone", "website",
       "isEmergency", "is24Hours", "services", "googlePlaceId", "verified", "source")
    VALUES
      (gen_random_uuid(), ${m.type}::"PlaceType", ${m.name},
       ST_SetSRID(ST_MakePoint(${m.lng}, ${m.lat}), 4326)::geography,
       ${m.address}, ${m.phone}, ${m.website},
       ${m.isEmergency}, ${m.is24Hours}, ARRAY[]::text[],
       ${m.googlePlaceId}, false, 'GOOGLE_PLACES'::"PlaceSource")
    ON CONFLICT ("googlePlaceId") DO UPDATE SET
      "name" = EXCLUDED."name",
      "location" = EXCLUDED."location",
      "address" = EXCLUDED."address",
      "phone" = EXCLUDED."phone",
      "website" = EXCLUDED."website",
      "isEmergency" = EXCLUDED."isEmergency",
      "is24Hours" = EXCLUDED."is24Hours",
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "Place"."verified" = false
  `;
}

/**
 * Pull nearby vets/shelters from Google Places into the Place table.
 * No-op when the API key is missing or the area was enriched recently.
 * Callers should treat failures as non-fatal — curated data still serves.
 */
export async function enrichNearby(options: {
  lat: number;
  lng: number;
  radiusKm: number;
  type?: PlaceType;
}): Promise<void> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return;

  const { lat, lng, radiusKm, type } = options;
  const key = cellKey(lat, lng, type);
  const cached = await prisma.enrichmentArea.findUnique({ where: { cellKey: key } });
  if (cached && Date.now() - cached.enrichedAt.getTime() < CACHE_TTL_MS) return;

  const radius = Math.min(radiusKm * 1000, MAX_GOOGLE_RADIUS_M);
  const circle = { center: { latitude: lat, longitude: lng }, radius };
  // Deduped by googlePlaceId; a place found by both searches keeps its vet
  // mapping (vets are added first), preserving the emergency flags.
  const mapped = new Map<string, MappedPlace>();

  // "veterinary_care" is a first-class Places type; shelters have no
  // dedicated type, so those go through text search instead.
  if (type !== "SHELTER") {
    const places = await fetchGooglePlaces(
      SEARCH_NEARBY_URL,
      {
        includedTypes: ["veterinary_care"],
        maxResultCount: 20,
        locationRestriction: { circle },
      },
      apiKey,
    );
    for (const place of places) {
      const m = mapGooglePlace(place, "VET");
      if (m && !mapped.has(m.googlePlaceId)) mapped.set(m.googlePlaceId, m);
    }
  }
  if (!type || type === "SHELTER") {
    const places = await fetchGooglePlaces(
      SEARCH_TEXT_URL,
      { textQuery: "animal shelter", pageSize: 20, locationBias: { circle } },
      apiKey,
    );
    for (const place of places) {
      const m = mapGooglePlace(place, "SHELTER");
      if (m && !mapped.has(m.googlePlaceId)) mapped.set(m.googlePlaceId, m);
    }
  }

  for (const m of mapped.values()) {
    await upsertPlace(m);
  }

  await prisma.enrichmentArea.upsert({
    where: { cellKey: key },
    update: { enrichedAt: new Date() },
    create: { cellKey: key },
  });
}
