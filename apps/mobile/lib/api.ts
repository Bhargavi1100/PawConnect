import type { GeocodeResult, NearbyResponse, PlaceType } from "@pawconnect/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchNearby(options: {
  lat: number;
  lng: number;
  type?: PlaceType;
  emergency?: boolean;
}): Promise<NearbyResponse> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lng: String(options.lng),
  });
  if (options.type) params.set("type", options.type);
  if (options.emergency) params.set("emergency", "true");

  const res = await fetch(`${API_URL}/api/v1/places/nearby?${params}`);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return (await res.json()) as NearbyResponse;
}

/** Resolve a typed city / ZIP / PIN code to coordinates via the API. */
export async function fetchGeocode(query: string): Promise<GeocodeResult> {
  const res = await fetch(`${API_URL}/api/v1/geocode?q=${encodeURIComponent(query)}`);
  const data = (await res.json()) as GeocodeResult & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Location search failed (${res.status})`);
  }
  return data;
}
