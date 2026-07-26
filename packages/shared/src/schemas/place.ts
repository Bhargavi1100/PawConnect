import { z } from "zod";
import {
  DEFAULT_SEARCH_RADIUS_KM,
  MAX_NEARBY_RESULTS,
  MAX_SEARCH_RADIUS_KM,
} from "../constants";
import { WeeklyHoursSchema } from "../hours";

export const PlaceTypeSchema = z.enum(["VET_CLINIC", "VET_HOSPITAL", "SHELTER"]);
export type PlaceType = z.infer<typeof PlaceTypeSchema>;

export const ShelterServiceSchema = z.enum(["ADOPTION", "SURRENDER", "LOST_AND_FOUND"]);
export type ShelterService = z.infer<typeof ShelterServiceSchema>;

const booleanParam = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();

/** Query params accepted by GET /api/v1/places/nearby (all arrive as strings). */
export const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  type: PlaceTypeSchema.optional(),
  radiusKm: z.coerce
    .number()
    .min(0.1)
    .max(MAX_SEARCH_RADIUS_KM)
    .default(DEFAULT_SEARCH_RADIUS_KM),
  emergency: booleanParam,
  openNow: booleanParam,
  limit: z.coerce.number().int().min(1).max(MAX_NEARBY_RESULTS).default(20),
});
export type NearbyQuery = z.infer<typeof NearbyQuerySchema>;

export const PlaceSummarySchema = z.object({
  id: z.string(),
  type: PlaceTypeSchema,
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  isEmergency: z.boolean(),
  is24Hours: z.boolean(),
  services: z.array(z.string()),
  verified: z.boolean(),
  distanceKm: z.number(),
  /** Open at request time in the place's own timezone; null = unknown. */
  openNow: z.boolean().nullable(),
});
export type PlaceSummary = z.infer<typeof PlaceSummarySchema>;

export const NearbyResponseSchema = z.object({
  results: z.array(PlaceSummarySchema),
});
export type NearbyResponse = z.infer<typeof NearbyResponseSchema>;

export const PlaceDetailSchema = PlaceSummarySchema.omit({ distanceKm: true }).extend({
  hours: WeeklyHoursSchema.nullable(),
  timezone: z.string().nullable(),
  googlePlaceId: z.string().nullable(),
  source: z.enum(["CURATED", "GOOGLE_PLACES"]),
});
export type PlaceDetail = z.infer<typeof PlaceDetailSchema>;
