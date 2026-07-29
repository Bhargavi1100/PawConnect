"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  googleMapsDirectionsUrl,
  telUrl,
  type GeocodeResult,
  type NearbyResponse,
  type PlaceSummary,
  type PlaceType,
} from "@pawconnect/shared";
import { MAPS_KEY, ResultsMap } from "./ResultsMap";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Props = {
  /** Which place types to search (queried one type at a time; omit for all). */
  type?: PlaceType;
  emergency?: boolean;
  emptyMessage: string;
};

type State =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      places: PlaceSummary[];
      center: { lat: number; lng: number };
    };

export function PlaceFinder({ type, emergency, emptyMessage }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });

  const search = useCallback(
    async (lat: number, lng: number) => {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
        if (type) params.set("type", type);
        if (emergency) params.set("emergency", "true");
        const res = await fetch(`${API_URL}/api/v1/places/nearby?${params}`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = (await res.json()) as NearbyResponse;
        setState({ status: "ready", places: data.results, center: { lat, lng } });
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Something went wrong while searching.",
        });
      }
    },
    [type, emergency],
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Geolocation is not available in this browser." });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => void search(pos.coords.latitude, pos.coords.longitude),
      () =>
        setState({
          status: "error",
          message:
            "Location permission was denied. Search by city or ZIP/PIN code below instead.",
        }),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [search]);

  const searchByQuery = useCallback(
    async (query: string) => {
      setState({ status: "loading" });
      try {
        const res = await fetch(`${API_URL}/api/v1/geocode?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as GeocodeResult & { error?: { message?: string } };
        if (!res.ok) {
          throw new Error(data.error?.message ?? `Location search failed (${res.status})`);
        }
        await search(data.lat, data.lng);
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Location search failed, please try again.",
        });
      }
    },
    [search],
  );

  useEffect(() => {
    locate();
  }, [locate]);

  if (state.status === "idle" || state.status === "locating") {
    return <Status text="📍 Getting your location…" />;
  }
  if (state.status === "loading") {
    return <Status text="🔎 Searching nearby…" />;
  }
  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">{state.message}</p>
        <button
          onClick={locate}
          className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
        >
          📍 Use my location
        </button>
        <div className="mx-auto mt-6 max-w-md border-t border-red-200 pt-5">
          <LocationSearchForm onSearch={searchByQuery} />
        </div>
      </div>
    );
  }
  if (state.places.length === 0) {
    return <Status text={emptyMessage} />;
  }
  const list = (
    <ul className="space-y-4">
      {state.places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </ul>
  );
  if (!MAPS_KEY) {
    return (
      <div>
        {list}
        <p className="mt-4 text-center text-sm text-gray-400">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see results on an interactive map.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-80 overflow-hidden rounded-xl border shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:self-start">
        <ResultsMap places={state.places} center={state.center} />
      </div>
      {list}
    </div>
  );
}

function LocationSearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed);
  };

  return (
    <form onSubmit={submit}>
      <label htmlFor="location-search" className="font-medium text-gray-700">
        Or search by city or ZIP / PIN code
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="location-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Bengaluru, Mumbai, 10036, 560034"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-5 py-2 font-semibold text-white hover:bg-brand-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function Status({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-white p-8 text-center text-lg text-gray-600">
      {text}
    </div>
  );
}

function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <li className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{place.name}</h2>
          <p className="text-gray-600">{place.address}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {place.distanceKm.toFixed(1)} km away
            </span>
            {place.is24Hours ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                Open 24/7
              </span>
            ) : place.openNow === true ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                Open now
              </span>
            ) : place.openNow === false ? (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-600">
                Closed now
              </span>
            ) : null}
            {place.isEmergency && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-800">
                Emergency care
              </span>
            )}
            {place.services.map((s) => (
              <span key={s} className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">
                {s.replaceAll("_", " ").toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {place.phone && (
            <a
              href={telUrl(place.phone)}
              className="rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
            >
              📞 Call
            </a>
          )}
          <a
            href={googleMapsDirectionsUrl(place.lat, place.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            🧭 Directions
          </a>
        </div>
      </div>
    </li>
  );
}
