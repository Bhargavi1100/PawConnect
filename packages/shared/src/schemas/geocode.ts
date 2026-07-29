import { z } from "zod";

/** Query params for GET /api/v1/geocode — free-text city, ZIP/PIN, or address. */
export const GeocodeQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
});
export type GeocodeQuery = z.infer<typeof GeocodeQuerySchema>;

export const GeocodeResultSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  formattedAddress: z.string(),
});
export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;
