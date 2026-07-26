# PawConnect API Reference (v1)

Base URL: `http://localhost:4000` (dev). All responses are JSON.
Validation schemas live in `packages/shared` (Zod) and are enforced server-side.

## Health

### `GET /api/v1/health`
```json
{ "status": "ok", "db": true }
```

## Places

### `GET /api/v1/places/nearby`

Find vet clinics/hospitals or shelters near a point, ordered by distance.

When the server is configured with `GOOGLE_MAPS_API_KEY`, this endpoint first
enriches the database from Google Places (New) for the searched area — vets via
`places:searchNearby` (`veterinary_care` type), shelters via `places:searchText`
— upserting results by `googlePlaceId`. Each map cell (~0.1° grid, per type) is
enriched at most once every 7 days, and enrichment failures never break the
search; manually `verified` rows are never overwritten by Google data.

| Query param | Type | Required | Notes |
|---|---|---|---|
| `lat` | number (−90…90) | yes | |
| `lng` | number (−180…180) | yes | |
| `type` | `VET_CLINIC` \| `VET_HOSPITAL` \| `SHELTER` | no | omit for all types |
| `radiusKm` | number (0.1…200, default 25) | no | search radius |
| `emergency` | `true`/`false` | no | only emergency-capable places |
| `openNow` | `true`/`false` | no | filters on 24h flag + hours data |
| `limit` | number (1…50, default 20) | no | |

**Response**
```json
{
  "results": [
    {
      "id": "…",
      "type": "VET_HOSPITAL",
      "name": "Midtown Animal Emergency Hospital",
      "lat": 40.7563,
      "lng": -73.9832,
      "address": "123 W 45th St, New York, NY",
      "phone": "+1-212-555-0142",
      "website": "https://…",
      "isEmergency": true,
      "is24Hours": true,
      "services": [],
      "verified": true,
      "distanceKm": 0.4
    }
  ]
}
```

Errors: `400` with `{ "error": { "message", "issues" } }` on invalid params.

### `GET /api/v1/places/:id`

Full detail for a single place (adds `hours`, `googlePlaceId`, `source`).
`404` if not found.

## Auth

### `POST /api/v1/auth/register`
Body: `{ "email", "password" (≥8 chars), "name" }` →
`201` `{ "user": { "id", "email", "name" }, "accessToken", "refreshToken" }`
`409` if the email is taken.

### `POST /api/v1/auth/login`
Body: `{ "email", "password" }` → same shape as register. `401` on bad credentials.

### `POST /api/v1/auth/refresh`
Body: `{ "refreshToken" }` → `{ "accessToken" }`. `401` on invalid/expired token.

### Authenticated requests
`Authorization: Bearer <accessToken>` — e.g. `GET /api/v1/auth/me` returns the
current user.

## Planned (see ROADMAP)
- `POST /api/v1/places/:id/reviews`, `GET /api/v1/users/me/saved-places`
- Admin CRUD & verification: `POST/PATCH /api/v1/admin/places`
