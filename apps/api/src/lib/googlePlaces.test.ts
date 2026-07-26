import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectAlwaysOpen,
  enrichNearby,
  isEnrichmentConfigured,
  mapGooglePlace,
  type GooglePlace,
} from "./googlePlaces";

const basePlace: GooglePlace = {
  id: "ChIJtest123",
  displayName: { text: "Happy Tails Veterinary Clinic" },
  formattedAddress: "1 Main St, New York, NY",
  location: { latitude: 40.75, longitude: -73.98 },
  internationalPhoneNumber: "+1 212-555-0100",
  websiteUri: "https://example.com",
};

describe("detectAlwaysOpen", () => {
  it("recognizes Google's 24/7 encoding (single Sunday-00:00 open, no close)", () => {
    expect(
      detectAlwaysOpen({ periods: [{ open: { day: 0, hour: 0, minute: 0 } }] }),
    ).toBe(true);
  });

  it("rejects normal weekly hours", () => {
    expect(
      detectAlwaysOpen({
        periods: [
          { open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 17 } },
          { open: { day: 2, hour: 9, minute: 0 }, close: { day: 2, hour: 17 } },
        ],
      }),
    ).toBe(false);
    expect(detectAlwaysOpen(undefined)).toBe(false);
  });
});

describe("mapGooglePlace", () => {
  it("maps a vet clinic with all fields", () => {
    const m = mapGooglePlace(basePlace, "VET");
    expect(m).toMatchObject({
      googlePlaceId: "ChIJtest123",
      type: "VET_CLINIC",
      name: "Happy Tails Veterinary Clinic",
      lat: 40.75,
      lng: -73.98,
      phone: "+1 212-555-0100",
      isEmergency: false,
      is24Hours: false,
    });
  });

  it("classifies hospitals and emergency capability from the name", () => {
    const hospital = mapGooglePlace(
      { ...basePlace, displayName: { text: "Midtown Animal Hospital" } },
      "VET",
    );
    expect(hospital?.type).toBe("VET_HOSPITAL");
    expect(hospital?.isEmergency).toBe(false);

    const emergency = mapGooglePlace(
      { ...basePlace, displayName: { text: "24hr Emergency Pet Care" } },
      "VET",
    );
    expect(emergency?.type).toBe("VET_HOSPITAL");
    expect(emergency?.isEmergency).toBe(true);
  });

  it("flags always-open vets as emergency-capable", () => {
    const m = mapGooglePlace(
      { ...basePlace, regularOpeningHours: { periods: [{ open: { day: 0, hour: 0, minute: 0 } }] } },
      "VET",
    );
    expect(m?.is24Hours).toBe(true);
    expect(m?.isEmergency).toBe(true);
  });

  it("maps shelters without vet heuristics", () => {
    const m = mapGooglePlace(
      { ...basePlace, displayName: { text: "City Animal Shelter & Emergency Intake" } },
      "SHELTER",
    );
    expect(m?.type).toBe("SHELTER");
    expect(m?.isEmergency).toBe(false);
  });

  it("returns null when required fields are missing", () => {
    expect(mapGooglePlace({ ...basePlace, id: undefined }, "VET")).toBeNull();
    expect(mapGooglePlace({ ...basePlace, displayName: undefined }, "VET")).toBeNull();
    expect(mapGooglePlace({ ...basePlace, location: {} }, "VET")).toBeNull();
  });
});

describe("enrichNearby", () => {
  const savedKey = process.env.GOOGLE_MAPS_API_KEY;

  beforeEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });
  afterEach(() => {
    if (savedKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = savedKey;
  });

  it("is a no-op without an API key (no DB or network access)", async () => {
    expect(isEnrichmentConfigured()).toBe(false);
    await expect(
      enrichNearby({ lat: 40.75, lng: -73.98, radiusKm: 25 }),
    ).resolves.toBeUndefined();
  });
});
