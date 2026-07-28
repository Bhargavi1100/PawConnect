# 🐾 PawConnect

**Find emergency vet care and animal shelters near you — fast.**

PawConnect is a website + mobile app for pet owners. Its two primary features are built for the moments that matter most:

1. **🚨 Emergency vet finder** — locate the nearest open vet hospital or clinic during an emergency, with one-tap call and directions.
2. **🏠 Shelter finder** — discover nearby animal shelters for adoption, surrender, or lost-and-found help.

See [docs/PLAN.md](docs/PLAN.md) for the full product & technical plan, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, [docs/API.md](docs/API.md) for the API reference, and [docs/ROADMAP.md](docs/ROADMAP.md) for future features.

## Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript everywhere |
| Website | Next.js (React) + Tailwind CSS |
| Mobile | React Native via Expo (Expo Router) |
| API | Node.js + Express |
| Database | PostgreSQL + PostGIS (geospatial "near me" queries) |
| ORM | Prisma |
| Maps & Places | Google Maps Platform |
| Monorepo | npm workspaces + Turborepo |

## Repository layout

```
apps/
  web/      → Next.js website
  mobile/   → Expo React Native app
  api/      → Express + Prisma REST API
packages/
  shared/   → Zod schemas & types shared by all apps
docs/       → Product plan, architecture, API reference, roadmap
```

## Getting started

**Prerequisites:** Node.js ≥ 20, Docker (for the local database).

```bash
# 1. Install dependencies (all workspaces)
npm install

# 2. Start PostgreSQL + PostGIS
docker compose up -d

# 3. Configure the API
cp .env.example apps/api/.env   # edit if needed

# 4. Create tables and seed sample data
npm run db:setup --workspace @pawconnect/api

# 5. Run the API (http://localhost:4000)
npm run dev --workspace @pawconnect/api

# 6. Run the website (http://localhost:3000)
cp .env.example apps/web/.env.local
npm run dev --workspace @pawconnect/web

# 7. Run the mobile app (Expo Go)
cd apps/mobile && npx expo install --fix && npx expo start
```

Try it: open `http://localhost:3000/emergency`, or

```bash
curl "http://localhost:4000/api/v1/places/nearby?lat=40.7580&lng=-73.9855&type=VET_HOSPITAL"
```

Google Maps API keys are optional for local development — seeded sample data powers nearby search without any external API.

## Deployment

**Website → Vercel.** Import the repo and set **Root Directory to `apps/web`**
(Project Settings → General) — that's the supported monorepo setup and stops
Vercel from wrapping the API as a broken serverless function. With Root
Directory set, no `vercel.json` is needed (and a repo-root one with path
overrides will conflict — don't add one back). Set `NEXT_PUBLIC_API_URL`
(your deployed API) and optionally `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in the
Vercel project env.

**API → Railway / Render** (or any Node host; needs PostgreSQL with PostGIS —
e.g. Railway Postgres, Neon, or Supabase):
- Build: `npm install && npm run build --workspace @pawconnect/api`
- Start: `npm start --workspace @pawconnect/api` — runs the bundled
  `dist/index.js` under plain Node (no tsx needed in production)
- Env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT`,
  optional `GOOGLE_MAPS_API_KEY`
- Once: `npm run db:setup --workspace @pawconnect/api` (migrate + seed)

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Build all workspaces (Turborepo) |
| `npm run typecheck` | Type-check all workspaces |
| `npm run test` | Run tests |
| `npm run dev` | Run all dev servers |
