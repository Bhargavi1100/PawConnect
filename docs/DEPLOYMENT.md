# PawConnect — Deployment

Two deployables: the **website** (Vercel) and the **API + database** (Railway).
The website is useless without the API — every search calls it — so deploy the
API first, then point the website at it.

---

## 1. API + database → Railway

### 1a. Create the database (PostGIS required)

PawConnect's nearby search is built on PostGIS (`geography` columns, `ST_DWithin`,
KNN distance ordering). The first migration runs `CREATE EXTENSION IF NOT EXISTS
postgis`, so **the database image must ship PostGIS** — a plain Postgres instance
will fail on the very first deploy.

In your Railway project: **New → Database → Deploy PostgreSQL**, then try
`CREATE EXTENSION postgis;` in its query console. If that errors, delete it and
instead use **New → Docker Image → `postgis/postgis:16-3.4`**, setting
`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` as service variables.
The PostGIS image is the guaranteed path.

### 1b. Create the API service

**New → GitHub Repo → this repository.** The repo root already contains
`railway.json`, which configures everything:

| Setting | Value |
|---|---|
| Build | `npm run build --workspace @pawconnect/api` |
| Start | `npm run db:migrate --workspace @pawconnect/api && npm start --workspace @pawconnect/api` |
| Healthcheck | `/api/v1/health` |

Keep the service's root directory at the repository root — the API imports the
`@pawconnect/shared` workspace, so it needs the whole monorepo to install.
Migrations run automatically on every deploy; the build produces a bundled
`dist/index.js` that runs under plain Node (no `tsx` in production).

### 1c. Set service variables

| Variable | Value |
|---|---|
| `DATABASE_URL` | Reference the database service, e.g. `${{Postgres.DATABASE_URL}}` |
| `JWT_ACCESS_SECRET` | A long random string |
| `JWT_REFRESH_SECRET` | A different long random string |
| `GOOGLE_MAPS_API_KEY` | *(optional)* enables live Google Places enrichment and the city/PIN geocoding endpoint |

`PORT` is injected by Railway and read automatically — don't set it yourself.

### 1d. Generate a public URL

**Settings → Networking → Generate Domain.** Verify it:

```bash
curl https://<your-api>.up.railway.app/api/v1/health
# {"status":"ok","db":true}
```

`"db": false` means the API is up but can't reach Postgres — check `DATABASE_URL`.

### 1e. Seed sample data (once, optional)

A fresh database returns empty results (correctly, not an error). To load the
sample vets/shelters for NYC and the Indian metros:

```bash
railway run npm run db:seed --workspace @pawconnect/api
```

The seed is idempotent — it skips if any places already exist. With
`GOOGLE_MAPS_API_KEY` set, real nearby places are pulled from Google Places on
first search of an area regardless of seeding.

---

## 2. Website → Vercel

Import the repo and set **Root Directory to `apps/web`** (Project Settings →
General). With Root Directory set, no repo-root `vercel.json` is needed, and a
dashboard **Output Directory** override will double the path and break the build
— leave it on default.

Environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-api>.up.railway.app` (no trailing slash) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional)* renders the interactive results map |

Redeploy after setting them — `NEXT_PUBLIC_*` values are baked in at build time,
so changing them requires a new build, not just a restart.

---

## 3. Mobile app → EAS Build

`apps/mobile/eas.json` defines three profiles. The **preview** profile produces
an installable Android APK (and an iOS simulator build) — this is the way to get
the app onto a phone without a laptop running Metro. Note that Expo Go cannot
load EAS Updates; use a preview/development build instead.

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas init          # once — creates the EAS project and writes its id into app.json
eas build -p android --profile preview
```

Before building, replace `REPLACE-WITH-RAILWAY-URL` in `eas.json` with the
Railway API URL, or the app will launch but every search will fall back to the
manual city/PIN form.

---

## API keys

One Google Cloud key can serve everything, but split it for safety:

- **Server key** (`GOOGLE_MAPS_API_KEY` on Railway) — enable *Places API (New)*
  and *Geocoding API*. Restrict by IP if possible. Never expose it to clients.
- **Browser key** (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` on Vercel) — enable *Maps
  JavaScript API*, restrict by HTTP referrer to your Vercel domains. This one
  ships to the browser by design, so referrer restriction is what protects it.

## Hardening to revisit

The API currently sends permissive CORS (`cors()` with no origin allowlist),
which suits a public read-only search API but should be narrowed to the Vercel
domains once the origins are stable.
