# PawConnect — Architecture

## System overview

```
┌─────────────┐     ┌──────────────┐
│  Next.js    │     │  Expo app    │
│  (web)      │     │  (iOS/And.)  │
└──────┬──────┘     └──────┬───────┘
       │  HTTPS/JSON        │
       └────────┬───────────┘
                ▼
        ┌───────────────┐        ┌─────────────────────┐
        │  Express API   │ ─────▶ │ Google Maps Platform │
        │  (Node.js/TS)  │  (opt) │ Places / Geocoding   │
        └──────┬────────┘        └─────────────────────┘
               ▼
        ┌───────────────┐
        │ PostgreSQL     │
        │  + PostGIS     │
        └───────────────┘
```

Both clients speak to one REST API. The API owns all data access and all Google
Platform server-side calls (Places search, Geocoding), so API keys with billing
never ship inside clients. Clients use Google only for map *display* (embed /
native map SDK) and deep links to the Google Maps app for directions.

## Monorepo layout

```
apps/api      Express REST API + Prisma + PostGIS migrations + seed
apps/web      Next.js (App Router) website
apps/mobile   Expo (Expo Router) React Native app
packages/shared  Zod schemas + TS types shared by all three
```

`packages/shared` is the contract: request/response schemas are defined once in
Zod, the API validates inbound requests with them, and clients import the
inferred types. A contract change is a single edit that type-errors every
out-of-date consumer.

## Geospatial design

- `Place.location` is `geography(Point, 4326)` — real-world meters, no
  projection math in app code.
- A **GiST index** on `location` makes both the radius filter
  (`ST_DWithin`) and the KNN ordering (`ORDER BY location <-> point`) index
  scans; nearby queries stay fast at any table size.
- Prisma doesn't model PostGIS natively, so the column is declared
  `Unsupported("geography(Point, 4326)")` in the schema and queried via
  `prisma.$queryRaw` with parameterized SQL (see
  `apps/api/src/routes/places.ts`).

## Places data strategy

1. **Curated data first.** Seeded/admin-verified rows have accurate
   `isEmergency`, `is24Hours`, and hours — the things Google often gets wrong
   and that matter most at 2 AM.
2. **Google Places as enrichment.** When enabled (server-side key), nearby
   searches can pull Google results for coverage; each result is upserted into
   `Place` (keyed by `googlePlaceId`) so repeat searches hit our DB, not
   Google's billing meter.
3. **Verification flag.** `verified=true` rows outrank unverified ones in
   emergency results.

## Auth

- Email/password → bcrypt hash; login issues a short-lived **JWT access token**
  and a long-lived **refresh token**.
- Stateless verification middleware on protected routes; clients store tokens
  (web: httpOnly cookie in production; mobile: SecureStore).

## Emergency-path resilience

- The emergency page/screen renders from the API only — no client-side Google
  dependency — so it works even if Maps fails to load.
- Mobile caches the last successful nearby result for offline fallback.
- Manual location entry (city/ZIP) covers denied geolocation permissions.
