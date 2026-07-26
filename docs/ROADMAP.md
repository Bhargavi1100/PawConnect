# PawConnect — Roadmap

## Phase 0 — Scaffold ✅ (this repository)
- Monorepo (npm workspaces + Turborepo), shared Zod contracts
- API: PostGIS nearby search, place detail, JWT auth, seed data
- Web: landing, emergency finder, shelter finder pages
- Mobile: Expo app skeleton with Emergency / Shelters / Profile tabs

## Phase 1 — MVP launch
- ✅ Google Places enrichment + response caching (server-side; per-cell 7-day
  cache in `EnrichmentArea`, results upserted into `Place` by `googlePlaceId`)
- Open-now computation from structured hours (timezone-aware)
- Manual location entry (city/ZIP via Geocoding) as geolocation fallback
- Interactive maps on web (Maps JS) and mobile (react-native-maps)
- Place detail pages with directions deep links
- Admin: add/edit/verify places
- Deploy: Vercel (web), Railway/Render (API + DB), EAS builds (mobile)

## Phase 2 — Community & retention
- ⭐ Reviews and ratings on vets & shelters
- ❤️ Saved / favorite places, per-pet emergency card (nearest saved vet)
- 🏠 Shelter adoption listings — pet profiles with photos, filters (species, age)
- 🔔 Push notifications (Expo): saved-shelter news, new adoptable pets nearby
- Social login (Google / Apple)

## Phase 3 — Care workflows
- 📅 Appointment booking with participating vet clinics
- 🚩 Lost & Found pet board with geo-alerts to nearby users
- 💉 Pet health records: vaccination & medication reminders
- 🏥 Clinic-side dashboard (manage profile, hours, emergency status)

## Phase 4 — Scale & intelligence
- 🩺 Telehealth vet video consultations
- 🤖 AI triage assistant: "Is this an emergency?" symptom checker that routes
  to the emergency finder when warranted (with clear not-medical-advice framing)
- 🌍 Multilingual support; internationalized places data
- 💬 Community forum for pet owners
- Partnerships: shelter data feeds (e.g. Petfinder API), vet networks

## Engineering follow-ups
- Playwright e2e suite for web; Detox or Maestro for mobile
- CI (GitHub Actions): typecheck, tests, build on every PR
- Rate limiting & API key management; observability (structured logs, Sentry)
- PostGIS data pipeline for bulk-importing public vet/shelter datasets
