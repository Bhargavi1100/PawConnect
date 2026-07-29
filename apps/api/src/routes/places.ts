import { Router } from "express";
import {
  isOpenAt,
  MAX_NEARBY_RESULTS,
  NearbyQuerySchema,
  type PlaceSummary,
  type WeeklyHours,
} from "@pawconnect/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { enrichNearby, isEnrichmentConfigured } from "../lib/googlePlaces";

export const placesRouter = Router();

type NearbyRow = Omit<PlaceSummary, "distanceKm" | "openNow"> & {
  distanceMeters: number;
  hours: WeeklyHours | null;
  timezone: string | null;
};

/**
 * GET /api/v1/places/nearby?lat&lng&type&radiusKm&emergency&openNow&limit
 *
 * PostGIS does the heavy lifting: ST_DWithin filters by radius using the GiST
 * index, and the KNN operator (<->) orders by true distance. Open-now is then
 * computed per place in the place's own timezone (isOpenAt, packages/shared);
 * with openNow=true only places KNOWN to be open are returned — places with
 * unknown hours are excluded.
 */
placesRouter.get("/nearby", async (req, res) => {
  const parsed = NearbyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: { message: "Invalid query parameters", issues: parsed.error.issues },
    });
    return;
  }
  const { lat, lng, type, radiusKm, emergency, openNow, limit } = parsed.data;

  // Best-effort Google Places enrichment: fills the Place table for this
  // area (cached 7 days per cell) so the PostGIS query below serves a
  // unified result set. Failures never break the search — curated data
  // still serves.
  if (isEnrichmentConfigured()) {
    try {
      await enrichNearby({ lat, lng, radiusKm, type });
    } catch (err) {
      console.warn("Google Places enrichment failed:", err);
    }
  }

  const point = Prisma.sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
  const filters = [
    Prisma.sql`ST_DWithin("location", ${point}, ${radiusKm * 1000})`,
  ];
  if (type) filters.push(Prisma.sql`"type" = ${type}::"PlaceType"`);
  if (emergency) filters.push(Prisma.sql`"isEmergency" = true`);

  // Open-now filtering happens after the query, so over-fetch to keep the
  // post-filter from under-filling the requested limit.
  const fetchLimit = openNow ? MAX_NEARBY_RESULTS : limit;

  const rows = await prisma.$queryRaw<NearbyRow[]>`
    SELECT
      "id", "type", "name", "address", "phone", "website",
      "isEmergency", "is24Hours", "services", "verified",
      "hours", "timezone",
      ST_Y("location"::geometry) AS "lat",
      ST_X("location"::geometry) AS "lng",
      ST_Distance("location", ${point}) AS "distanceMeters"
    FROM "Place"
    WHERE ${Prisma.join(filters, " AND ")}
    ORDER BY "location" <-> ${point}
    LIMIT ${fetchLimit}
  `;

  const now = new Date();
  const results: PlaceSummary[] = rows
    .map(({ distanceMeters, hours, timezone, ...row }) => ({
      ...row,
      distanceKm: Math.round((distanceMeters / 1000) * 100) / 100,
      openNow: isOpenAt({ hours, timezone, is24Hours: row.is24Hours }, now),
    }))
    .filter((place) => !openNow || place.openNow === true)
    .slice(0, limit);
  res.json({ results });
});

type DetailRow = {
  is24Hours: boolean;
  hours: WeeklyHours | null;
  timezone: string | null;
  [key: string]: unknown;
};

/** GET /api/v1/places/:id — full detail for one place. */
placesRouter.get("/:id", async (req, res) => {
  const rows = await prisma.$queryRaw<DetailRow[]>`
    SELECT
      "id", "type", "name", "address", "phone", "website", "hours", "timezone",
      "isEmergency", "is24Hours", "services", "verified",
      "googlePlaceId", "source",
      ST_Y("location"::geometry) AS "lat",
      ST_X("location"::geometry) AS "lng"
    FROM "Place"
    WHERE "id" = ${req.params.id}
    LIMIT 1
  `;
  if (rows.length === 0) {
    res.status(404).json({ error: { message: "Place not found" } });
    return;
  }
  const place = rows[0];
  res.json({ ...place, openNow: isOpenAt(place) });
});
