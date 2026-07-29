import { z } from "zod";

/**
 * Weekly opening hours in the place's LOCAL time.
 * Times are "HH:MM" 24-hour strings; a range whose close is at or before its
 * open (e.g. 20:00–02:00) spans midnight into the next day.
 */
const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM");

export const HoursRangeSchema = z.object({
  open: TimeSchema,
  close: TimeSchema,
});
export type HoursRange = z.infer<typeof HoursRangeSchema>;

export const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const WeeklyHoursSchema = z
  .object({
    sun: z.array(HoursRangeSchema),
    mon: z.array(HoursRangeSchema),
    tue: z.array(HoursRangeSchema),
    wed: z.array(HoursRangeSchema),
    thu: z.array(HoursRangeSchema),
    fri: z.array(HoursRangeSchema),
    sat: z.array(HoursRangeSchema),
  })
  .partial();
export type WeeklyHours = z.infer<typeof WeeklyHoursSchema>;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Day-of-week index and minutes-since-midnight at `now` in `timezone`. */
function localClock(timezone: string, now: Date): { day: number; minutes: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    const weekday = get("weekday");
    const hour = get("hour");
    const minute = get("minute");
    if (!weekday || !hour || !minute) return null;
    const day = WEEK_DAYS.findIndex((d) => weekday.toLowerCase().startsWith(d));
    if (day === -1) return null;
    return { day, minutes: Number(hour) * 60 + Number(minute) };
  } catch {
    // Invalid IANA timezone id.
    return null;
  }
}

/**
 * Whether a place is open at `now`, evaluated in the place's own timezone —
 * never the server's. This is what makes open-now correct across regions
 * (IST has no DST; the US does; the server could be anywhere).
 *
 * Returns null when it cannot be known (missing hours or timezone, or an
 * invalid timezone id), so callers can distinguish "closed" from "unknown".
 */
export function isOpenAt(
  place: {
    hours: WeeklyHours | null | undefined;
    timezone: string | null | undefined;
    is24Hours: boolean;
  },
  now: Date = new Date(),
): boolean | null {
  if (place.is24Hours) return true;
  if (!place.hours || !place.timezone) return null;

  const clock = localClock(place.timezone, now);
  if (!clock) return null;

  const today = WEEK_DAYS[clock.day];
  const yesterday = WEEK_DAYS[(clock.day + 6) % 7];

  for (const range of place.hours[today] ?? []) {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);
    if (close > open) {
      if (clock.minutes >= open && clock.minutes < close) return true;
    } else if (clock.minutes >= open) {
      // Overnight range that started today and runs past midnight.
      return true;
    }
  }
  for (const range of place.hours[yesterday] ?? []) {
    const open = toMinutes(range.open);
    const close = toMinutes(range.close);
    // Overnight range that started yesterday and is still running.
    if (close <= open && clock.minutes < close) return true;
  }
  return false;
}
