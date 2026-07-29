import { PrismaClient } from "@prisma/client";
import type { WeeklyHours } from "@pawconnect/shared";

const prisma = new PrismaClient();

type SeedPlace = {
  type: "VET_CLINIC" | "VET_HOSPITAL" | "SHELTER";
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  website: string | null;
  isEmergency: boolean;
  is24Hours: boolean;
  services: string[];
  timezone: string;
  hours: WeeklyHours | null;
};

// Sample data for two launch regions — Manhattan, NYC and three Indian metros
// (Bengaluru, Mumbai, Delhi) — enough to exercise nearby search, distance
// ordering, and the emergency/type filters locally. All entries are fictional.

const OPEN_DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;

function daily(open: string, close: string): WeeklyHours {
  const range = [{ open, close }];
  return { sun: range, mon: range, tue: range, wed: range, thu: range, fri: range, sat: range };
}

function weekdays(open: string, close: string, extra: WeeklyHours = {}): WeeklyHours {
  const range = [{ open, close }];
  const hours: WeeklyHours = { ...extra };
  for (const day of OPEN_DAYS) hours[day] = range;
  return hours;
}

const places: SeedPlace[] = [
  {
    type: "VET_HOSPITAL",
    name: "Midtown Animal Emergency Hospital",
    lat: 40.7563, lng: -73.9832,
    address: "123 W 45th St, New York, NY 10036",
    phone: "+1-212-555-0142",
    website: "https://example.com/midtown-emergency",
    isEmergency: true, is24Hours: true, services: [],
    timezone: "America/New_York", hours: null,
  },
  {
    type: "VET_HOSPITAL",
    name: "Uptown 24/7 Veterinary Hospital",
    lat: 40.7812, lng: -73.9665,
    address: "456 Madison Ave, New York, NY 10028",
    phone: "+1-212-555-0177",
    website: "https://example.com/uptown-vet",
    isEmergency: true, is24Hours: true, services: [],
    timezone: "America/New_York", hours: null,
  },
  {
    type: "VET_CLINIC",
    name: "Chelsea Neighborhood Vet Clinic",
    lat: 40.7420, lng: -74.0000,
    address: "78 8th Ave, New York, NY 10014",
    phone: "+1-212-555-0110",
    website: "https://example.com/chelsea-vet",
    isEmergency: false, is24Hours: false, services: [],
    timezone: "America/New_York", hours: weekdays("09:00", "18:00", { sat: [{ open: "10:00", close: "16:00" }] }),
  },
  {
    type: "VET_CLINIC",
    name: "East Village Pet Care",
    lat: 40.7270, lng: -73.9830,
    address: "210 E 6th St, New York, NY 10003",
    phone: "+1-212-555-0128",
    website: null,
    isEmergency: false, is24Hours: false, services: [],
    timezone: "America/New_York", hours: daily("10:00", "20:00"),
  },
  {
    type: "VET_HOSPITAL",
    name: "Brooklyn Heights Animal Hospital",
    lat: 40.6959, lng: -73.9936,
    address: "34 Clark St, Brooklyn, NY 11201",
    phone: "+1-718-555-0163",
    website: "https://example.com/bk-heights",
    isEmergency: true, is24Hours: false, services: [],
    timezone: "America/New_York", hours: daily("08:00", "22:00"),
  },
  {
    type: "SHELTER",
    name: "Manhattan Animal Care Center",
    lat: 40.7871, lng: -73.9430,
    address: "326 E 110th St, New York, NY 10029",
    phone: "+1-212-555-0190",
    website: "https://example.com/macc",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "SURRENDER", "LOST_AND_FOUND"],
    timezone: "America/New_York", hours: daily("10:00", "17:00"),
  },
  {
    type: "SHELTER",
    name: "Hudson River Humane Society",
    lat: 40.7484, lng: -74.0047,
    address: "500 West St, New York, NY 10011",
    phone: "+1-212-555-0155",
    website: "https://example.com/hudson-humane",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "LOST_AND_FOUND"],
    timezone: "America/New_York", hours: daily("10:00", "18:00"),
  },
  {
    type: "SHELTER",
    name: "Brooklyn Paws Rescue Shelter",
    lat: 40.6782, lng: -73.9442,
    address: "88 Nostrand Ave, Brooklyn, NY 11205",
    phone: "+1-718-555-0181",
    website: "https://example.com/bk-paws",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "SURRENDER"],
    timezone: "America/New_York", hours: weekdays("11:00", "17:00"),
  },

  // --- Bengaluru ---
  {
    type: "VET_HOSPITAL",
    name: "Koramangala 24x7 Pet Emergency Hospital",
    lat: 12.9352, lng: 77.6245,
    address: "80 Feet Rd, Koramangala, Bengaluru, Karnataka 560034",
    phone: "+91-80-4000-1001",
    website: "https://example.com/koramangala-emergency",
    isEmergency: true, is24Hours: true, services: [],
    timezone: "Asia/Kolkata", hours: null,
  },
  {
    type: "VET_CLINIC",
    name: "Indiranagar Pet Care Clinic",
    lat: 12.9784, lng: 77.6408,
    address: "100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038",
    phone: "+91-80-4000-1002",
    website: null,
    isEmergency: false, is24Hours: false, services: [],
    timezone: "Asia/Kolkata", hours: weekdays("09:30", "20:30", { sat: [{ open: "09:30", close: "20:30" }] }),
  },
  {
    type: "SHELTER",
    name: "Hebbal Animal Rescue & Shelter Trust",
    lat: 13.0358, lng: 77.5970,
    address: "Bellary Rd, Hebbal, Bengaluru, Karnataka 560024",
    phone: "+91-80-4000-1003",
    website: "https://example.com/hebbal-shelter",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "SURRENDER", "LOST_AND_FOUND"],
    timezone: "Asia/Kolkata", hours: daily("09:00", "18:00"),
  },

  // --- Mumbai ---
  {
    type: "VET_HOSPITAL",
    name: "Bandra Emergency Animal Hospital",
    lat: 19.0596, lng: 72.8295,
    address: "Hill Rd, Bandra West, Mumbai, Maharashtra 400050",
    phone: "+91-22-4000-2001",
    website: "https://example.com/bandra-emergency",
    isEmergency: true, is24Hours: true, services: [],
    timezone: "Asia/Kolkata", hours: null,
  },
  {
    type: "SHELTER",
    name: "Parel Animal Welfare Shelter",
    lat: 19.0069, lng: 72.8397,
    address: "Dr. E Moses Rd, Parel, Mumbai, Maharashtra 400012",
    phone: "+91-22-4000-2002",
    website: "https://example.com/parel-shelter",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "LOST_AND_FOUND"],
    timezone: "Asia/Kolkata", hours: daily("10:00", "18:00"),
  },

  // --- Delhi ---
  {
    type: "VET_HOSPITAL",
    name: "South Delhi 24-Hour Veterinary Hospital",
    lat: 28.5494, lng: 77.2001,
    address: "Aurobindo Marg, Hauz Khas, New Delhi, Delhi 110016",
    phone: "+91-11-4000-3001",
    website: "https://example.com/south-delhi-vet",
    isEmergency: true, is24Hours: true, services: [],
    timezone: "Asia/Kolkata", hours: null,
  },
  {
    type: "SHELTER",
    name: "Yamuna Bank Animal Shelter & ABC Centre",
    lat: 28.6270, lng: 77.2775,
    address: "NH 24, Near Yamuna Bank, New Delhi, Delhi 110002",
    phone: "+91-11-4000-3002",
    website: "https://example.com/yamuna-shelter",
    isEmergency: false, is24Hours: false,
    services: ["ADOPTION", "SURRENDER", "LOST_AND_FOUND"],
    timezone: "Asia/Kolkata", hours: daily("09:00", "17:00"),
  },
];

async function main() {
  const existing = await prisma.place.count();
  if (existing > 0) {
    console.log(`Seed skipped — ${existing} places already in database.`);
    return;
  }
  for (const p of places) {
    // Raw SQL because Prisma can't write the PostGIS geography column directly.
    await prisma.$executeRaw`
      INSERT INTO "Place"
        ("id", "type", "name", "location", "address", "phone", "website",
         "isEmergency", "is24Hours", "services", "timezone", "hours",
         "verified", "source")
      VALUES
        (gen_random_uuid(), ${p.type}::"PlaceType", ${p.name},
         ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326)::geography,
         ${p.address}, ${p.phone}, ${p.website},
         ${p.isEmergency}, ${p.is24Hours}, ${p.services}::text[],
         ${p.timezone}, ${p.hours ? JSON.stringify(p.hours) : null}::jsonb,
         true, 'CURATED'::"PlaceSource")
    `;
  }
  const count = await prisma.place.count();
  console.log(`Seed complete — ${count} places in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
