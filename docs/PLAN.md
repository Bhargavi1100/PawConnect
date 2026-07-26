# PawConnect — Product & Technical Plan

## 1. Vision

Pet emergencies are terrifying, and most owners don't know where the nearest open emergency vet is. PawConnect answers two questions instantly:

- **"Where is the nearest vet hospital / vet care right now?"** — optimized for emergencies
- **"Where is the nearest animal shelter?"** — for adoption, surrender, and lost-and-found

The product ships as a **website** (SEO-friendly, works on any device, no install needed in a crisis) and a **mobile app** (location-aware, push notifications, saved places), sharing one TypeScript codebase for types, validation, and business logic.

## 2. Users & core scenarios

| User | Scenario | What PawConnect does |
|---|---|---|
| Panicked pet owner, 2 AM | Dog ate something toxic | `/emergency` → nearest open, emergency-capable vets, sorted by distance, one-tap call & directions |
| New pet owner | Needs a regular vet | Browse nearby clinics, hours, contact info |
| Prospective adopter | Wants to adopt | Nearby shelters with adoption services |
| Finder of a stray | Found a lost pet | Nearby shelters that take in strays / lost-and-found |

## 3. Languages & technologies

**One language everywhere: TypeScript.** Types and validation schemas are written once in `packages/shared` and consumed by the web app, mobile app, and API.

| Layer | Technology | Rationale |
|---|---|---|
| Website | **Next.js (React) + Tailwind CSS** | Server-side rendering for SEO ("emergency vet near me <city>"), fast first paint for emergency pages |
| Mobile app | **React Native via Expo** (Expo Router, expo-location) | iOS + Android from one codebase; shares types/logic with web; EAS handles builds & OTA updates |
| API | **Node.js + Express** | Simple, battle-tested REST API in the same language as the clients |
| Database | **PostgreSQL + PostGIS** | Purpose-built geospatial queries: `ST_DWithin` radius filtering + KNN (`<->`) distance ordering with a GiST index |
| ORM | **Prisma** | Type-safe queries; raw SQL escape hatch for PostGIS |
| Maps & Places | **Google Maps Platform** (Places API, Geocoding, Maps embeds/SDKs, deep links) | Best coverage for vet clinics/hospitals and shelters; familiar directions UX |
| Validation | **Zod** (shared) | One source of truth for API contracts on client and server |
| Auth | **JWT** (access + refresh) with bcrypt password hashing | Framework-agnostic across web + mobile; social login later |
| Monorepo | **npm workspaces + Turborepo** | Shared packages, cached builds |
| Testing | **Vitest** (unit/API), Playwright (web e2e, later) | |

### Target deployment

| Component | Platform |
|---|---|
| Website | Vercel |
| API + PostgreSQL | Railway or Render (managed Postgres with PostGIS) |
| Mobile builds | Expo EAS → App Store / Play Store |
| Local dev | Docker Compose (postgis/postgis image) |

## 4. Primary features (MVP)

### 4.1 Emergency vet finder
- Detect location (browser geolocation / expo-location); fall back to manual city/ZIP entry (Google Geocoding)
- `GET /api/v1/places/nearby?lat&lng&type=VET_HOSPITAL&emergency=true&openNow=true`
- Results come from PawConnect's **curated database** (verified emergency capability, 24/7 flags) and can be enriched with **Google Places** results, which are cached in the database to control API costs
- Sorted by distance; emergency-capable and open-now places surfaced first
- **One-tap Call** (`tel:` link) and **one-tap Directions** (Google Maps deep link)
- Emergency-first UI: large touch targets, high contrast, minimal steps — usable under stress

### 4.2 Shelter finder
- Same nearby-search flow with `type=SHELTER`
- Filters by service: adoption, surrender, lost-and-found
- Detail page: hours, services, phone, website, map

### 4.3 Accounts (foundation)
- Email/password registration & login (JWT)
- Enables Phase 2 features: saved places, reviews, notifications

## 5. Data model

```
Place
  id            uuid
  type          VET_CLINIC | VET_HOSPITAL | SHELTER
  name          text
  location      geography(Point, 4326)   ← PostGIS, GiST-indexed
  address       text
  phone         text?
  website       text?
  hours         jsonb?                    ← weekly schedule
  isEmergency   boolean                   ← handles emergencies
  is24Hours     boolean
  services      text[]                    ← shelters: adoption/surrender/lost-found
  googlePlaceId text?  (unique)           ← link/cache to Google Places
  verified      boolean                   ← manually verified data
  source        CURATED | GOOGLE_PLACES

User
  id, email (unique), passwordHash, name, role (USER | ADMIN)
```

The nearby query (raw SQL through Prisma):

```sql
SELECT *, ST_Distance(location, ST_MakePoint($lng, $lat)::geography) AS meters
FROM "Place"
WHERE type = $type
  AND ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, $radius_m)
ORDER BY location <-> ST_MakePoint($lng, $lat)::geography
LIMIT 50;
```

## 6. Non-functional requirements

- **Speed in emergencies:** emergency page interactive < 2s on 4G; API nearby query < 100ms (GiST index)
- **Offline resilience (mobile):** cache last results; degrade to phone-number list
- **Cost control:** Google Places responses cached in `Place` table; curated data served free
- **Privacy:** location used only for the search request, never stored with user identity
- **Accessibility:** WCAG AA contrast, screen-reader labels on all emergency actions

## 7. Delivery phases

See [ROADMAP.md](ROADMAP.md). This repository currently contains the Phase-0 scaffold: monorepo wiring, shared schemas, API with PostGIS nearby search + auth + seed data, web landing/emergency/shelter pages, and the Expo app skeleton.
