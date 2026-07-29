import { Linking, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { googleMapsDirectionsUrl, type PlaceSummary } from "@pawconnect/shared";

type Props = {
  places: PlaceSummary[];
  center: { lat: number; lng: number };
};

/**
 * Interactive map of search results. Uses the platform's default provider
 * (Apple Maps on iOS; Google Maps on Android — production Android builds
 * need a Google Maps key in app.json, see docs/PLAN.md).
 * Tapping a pin's callout opens Google Maps directions.
 */
export function ResultsMapView({ places, center }: Props) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      }}
      showsUserLocation
    >
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={place.name}
          description={`${place.distanceKm.toFixed(1)} km away${place.is24Hours ? " · Open 24/7" : ""} — tap for directions`}
          pinColor={place.isEmergency ? "#A85D4B" : "#66845C"}
          onCalloutPress={() =>
            void Linking.openURL(googleMapsDirectionsUrl(place.lat, place.lng))
          }
        />
      ))}
    </MapView>
  );
}
