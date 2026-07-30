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
import { LoaderCircle, LocateFixed, Navigation, Phone, Search } from "lucide-react";
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
    return <Status icon={<LoaderCircle className="h-5 w-5 animate-spin" />} text="Getting your location…" />;
  }
  if (state.status === "loading") {
    return <Status icon={<Search className="h-5 w-5" />} text="Searching nearby…" />;
  }
  if (state.status === "error") {
    return (
      <div className="rounded-2xl border border-cream-200 bg-white p-8 text-center shadow-sm">
        <p className="text-stone-700">{state.message}</p>
        <button
          onClick={locate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-clay-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-clay-700"
        >
          <LocateFixed className="h-4 w-4" />
          Use my location
        </button>
        <div className="mx-auto mt-7 max-w-md border-t border-cream-200 pt-6">
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
        <p className="mt-4 text-center text-sm text-stone-400">
          Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see results on an interactive map.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-80 overflow-hidden rounded-2xl border border-cream-200 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:self-start">
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
      <label htmlFor="location-search" className="font-medium text-stone-700">
        Or search by city or ZIP / PIN code
      </label>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <input
          id="location-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Bengaluru, Mumbai, 10036, 560034"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:border-sage-600 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-sage-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-sage-800 sm:w-auto"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function Status({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-cream-200 bg-white p-10 text-center text-lg text-stone-500 shadow-sm">
      {icon}
      {text}
    </div>
  );
}

function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <li className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">{place.name}</h2>
          <p className="mt-0.5 text-stone-500">{place.address}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-cream-100 px-3 py-1 text-stone-600">
              {place.distanceKm.toFixed(1)} km away
            </span>
            {place.is24Hours ? (
              <span className="rounded-full bg-sage-100 px-3 py-1 font-medium text-sage-800">
                Open 24/7
              </span>
            ) : place.openNow === true ? (
              <span className="rounded-full bg-sage-100 px-3 py-1 font-medium text-sage-800">
                Open now
              </span>
            ) : place.openNow === false ? (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-500">
                Closed now
              </span>
            ) : null}
            {place.isEmergency && (
              <span className="rounded-full bg-clay-100 px-3 py-1 font-medium text-clay-800">
                Emergency care
              </span>
            )}
            {place.services.map((s) => (
              <span key={s} className="rounded-full bg-tan-100 px-3 py-1 text-tan-600">
                {s.replaceAll("_", " ").toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {place.phone && (
            <a
              href={telUrl(place.phone)}
              className="inline-flex items-center gap-2 rounded-xl bg-sage-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-sage-800"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          <a
            href={googleMapsDirectionsUrl(place.lat, place.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-700 transition-colors hover:bg-cream-100"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
        </div>
      </div>
    </li>
  );
}
