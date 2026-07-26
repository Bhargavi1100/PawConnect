"use client";

import { useCallback, useEffect, useState } from "react";
import {
  googleMapsDirectionsUrl,
  telUrl,
  type NearbyResponse,
  type PlaceSummary,
  type PlaceType,
} from "@pawconnect/shared";

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
  | { status: "ready"; places: PlaceSummary[] };

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
        setState({ status: "ready", places: data.results });
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
            "Location permission was denied. Manual city/ZIP search is coming soon — please enable location access to search.",
        }),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, [search]);

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
          Try again
        </button>
      </div>
    );
  }
  if (state.places.length === 0) {
    return <Status text={emptyMessage} />;
  }
  return (
    <ul className="space-y-4">
      {state.places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </ul>
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
            {place.is24Hours && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                Open 24/7
              </span>
            )}
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
