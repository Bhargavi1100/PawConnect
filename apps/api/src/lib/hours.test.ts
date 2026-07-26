import { describe, expect, it } from "vitest";
import { isOpenAt, type WeeklyHours } from "@pawconnect/shared";

// 2026-01-15 is a Thursday; 2026-01-17 a Saturday.
const weekday9to5: WeeklyHours = {
  mon: [{ open: "09:00", close: "17:00" }],
  tue: [{ open: "09:00", close: "17:00" }],
  wed: [{ open: "09:00", close: "17:00" }],
  thu: [{ open: "09:00", close: "17:00" }],
  fri: [{ open: "09:00", close: "17:00" }],
};

function place(hours: WeeklyHours | null, timezone: string | null, is24Hours = false) {
  return { hours, timezone, is24Hours };
}

describe("isOpenAt — timezone awareness", () => {
  const now = new Date("2026-01-15T15:00:00Z");

  it("evaluates identical hours differently per timezone", () => {
    // 15:00 UTC = Thu 10:00 in New York (EST, UTC-5) → open
    expect(isOpenAt(place(weekday9to5, "America/New_York"), now)).toBe(true);
    // 15:00 UTC = Thu 20:30 in India (IST, UTC+5:30) → closed
    expect(isOpenAt(place(weekday9to5, "Asia/Kolkata"), now)).toBe(false);
  });

  it("respects US DST while IST is unaffected", () => {
    // 13:30 UTC in July = 09:30 EDT (UTC-4) → open
    expect(
      isOpenAt(place(weekday9to5, "America/New_York"), new Date("2026-07-15T13:30:00Z")),
    ).toBe(true);
    // 13:30 UTC in January = 08:30 EST (UTC-5) → not open yet
    expect(
      isOpenAt(place(weekday9to5, "America/New_York"), new Date("2026-01-14T13:30:00Z")),
    ).toBe(false);
    // IST has no DST: 05:00 UTC = 10:30 IST year-round → open
    expect(
      isOpenAt(place(weekday9to5, "Asia/Kolkata"), new Date("2026-07-15T05:00:00Z")),
    ).toBe(true);
    expect(
      isOpenAt(place(weekday9to5, "Asia/Kolkata"), new Date("2026-01-14T05:00:00Z")),
    ).toBe(true);
  });
});

describe("isOpenAt — boundaries and overnight ranges", () => {
  it("is exclusive of closing time and inclusive of opening time", () => {
    expect(
      isOpenAt(place(weekday9to5, "UTC"), new Date("2026-01-15T09:00:00Z")),
    ).toBe(true);
    expect(
      isOpenAt(place(weekday9to5, "UTC"), new Date("2026-01-15T17:00:00Z")),
    ).toBe(false);
  });

  it("handles ranges spanning midnight", () => {
    const lateNight: WeeklyHours = { sat: [{ open: "20:00", close: "02:00" }] };
    // Saturday 21:00 → open
    expect(isOpenAt(place(lateNight, "UTC"), new Date("2026-01-17T21:00:00Z"))).toBe(true);
    // Sunday 01:00 → still open (spill from Saturday)
    expect(isOpenAt(place(lateNight, "UTC"), new Date("2026-01-18T01:00:00Z"))).toBe(true);
    // Sunday 03:00 → closed
    expect(isOpenAt(place(lateNight, "UTC"), new Date("2026-01-18T03:00:00Z"))).toBe(false);
    // Saturday 19:00 → not open yet
    expect(isOpenAt(place(lateNight, "UTC"), new Date("2026-01-17T19:00:00Z"))).toBe(false);
  });

  it("closed on days without hours", () => {
    expect(
      isOpenAt(place(weekday9to5, "UTC"), new Date("2026-01-18T12:00:00Z")), // Sunday
    ).toBe(false);
  });
});

describe("isOpenAt — unknown and special cases", () => {
  it("24/7 places are always open regardless of hours data", () => {
    expect(isOpenAt(place(null, null, true))).toBe(true);
  });

  it("returns null when hours or timezone are missing or invalid", () => {
    expect(isOpenAt(place(null, "America/New_York"))).toBeNull();
    expect(isOpenAt(place(weekday9to5, null))).toBeNull();
    expect(isOpenAt(place(weekday9to5, "Not/AZone"))).toBeNull();
  });
});
