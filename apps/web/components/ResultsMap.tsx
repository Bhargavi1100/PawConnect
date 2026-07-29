"use client";

import { useState } from "react";
import { APIProvider, InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";
import {
  googleMapsDirectionsUrl,
  telUrl,
  type PlaceSummary,
} from "@pawconnect/shared";

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
  places: PlaceSummary[];
  center: { lat: number; lng: number };
};

/**
 * Interactive Google Map of search results. Render only when MAPS_KEY is set
 * — the finder pages fall back to the list-only layout without it.
 */
export function ResultsMap({ places, center }: Props) {
  const [selected, setSelected] = useState<PlaceSummary | null>(null);

  if (!MAPS_KEY) return null;

  return (
    <APIProvider apiKey={MAPS_KEY}>
      <Map
        defaultCenter={center}
        defaultZoom={12}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        <Marker position={center} title="Your location" label="●" />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            onClick={() => setSelected(place)}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="max-w-56">
              <p className="font-bold">{selected.name}</p>
              <p className="text-sm text-stone-500">
                {selected.distanceKm.toFixed(1)} km away
                {selected.is24Hours && " · Open 24/7"}
              </p>
              <div className="mt-2 flex gap-3 text-sm font-semibold">
                {selected.phone && (
                  <a href={telUrl(selected.phone)} className="text-sage-700 underline">
                    Call
                  </a>
                )}
                <a
                  href={googleMapsDirectionsUrl(selected.lat, selected.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-clay-700 underline"
                >
                  Directions
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
