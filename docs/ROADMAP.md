# PawConnect — Roadmap

## Phase 0 — Scaffold ✅ (this repository)
- Monorepo (npm workspaces + Turborepo), shared Zod contracts
- API: PostGIS nearby search, place detail, JWT auth, seed data
- Web: landing, emergency finder, shelter finder pages
- Mobile: Expo app skeleton with Emergency / Shelters / Profile tabs

## Phase 1 — MVP launch
- ✅ Google Places enrichment + response caching (server-side; per-cell 7-day
  cache in `EnrichmentArea`, results upserted into `Place` by `googlePlaceId`)
- ✅ Open-now computation from structured hours, evaluated in each place's
  own IANA timezone (DST-safe; overnight ranges supported)
- ✅ Manual location entry (city/ZIP/PIN via server-side Geocoding) as the
  fallback when device geolocation is denied or unavailable
- ✅ Interactive maps on web (`@vis.gl/react-google-maps` beside the results
  list, with pin info windows) and mobile (react-native-maps list/map toggle);
  both degrade to list-only without an API key
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
- 🌍 Multilingual support — India-first: Hindi, then Kannada, Marathi, Tamil,
  Telugu, Bengali — plus internationalized places data (Places API
  languageCode/regionCode per user locale)
- 💬 Community forum for pet owners
- Partnerships: shelter data feeds and vet networks — Indian rescue
  organizations (Blue Cross of India, CUPA, municipal ABC centres) and
  western feeds (e.g. Petfinder API)

## Engineering follow-ups
- Playwright e2e suite for web; Detox or Maestro for mobile
- CI (GitHub Actions): typecheck, tests, build on every PR
- Rate limiting & API key management; observability (structured logs, Sentry)
- PostGIS data pipeline for bulk-importing public vet/shelter datasets
