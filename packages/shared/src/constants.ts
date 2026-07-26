export const DEFAULT_SEARCH_RADIUS_KM = 25;
export const MAX_SEARCH_RADIUS_KM = 200;
export const MAX_NEARBY_RESULTS = 50;

/** Deep link that opens directions in the Google Maps app / website. */
export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** tel: link, stripping formatting characters. */
export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
