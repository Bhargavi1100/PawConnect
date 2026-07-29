import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import {
  googleMapsDirectionsUrl,
  telUrl,
  type PlaceSummary,
  type PlaceType,
} from "@pawconnect/shared";
import { fetchGeocode, fetchNearby } from "../lib/api";
import { ResultsMapView } from "./ResultsMapView";

type Props = {
  type?: PlaceType;
  emergency?: boolean;
  emptyMessage: string;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      places: PlaceSummary[];
      center: { lat: number; lng: number };
    };

export function PlaceListScreen({ type, emergency, emptyMessage }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [view, setView] = useState<"list" | "map">("list");

  const searchAt = useCallback(
    async (lat: number, lng: number) => {
      setState({ status: "loading" });
      try {
        const data = await fetchNearby({ lat, lng, type, emergency });
        setState({ status: "ready", places: data.results, center: { lat, lng } });
      } catch (err) {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [type, emergency],
  );

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState({
          status: "error",
          message:
            "Location permission was denied. Search by city or ZIP/PIN code below instead.",
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await searchAt(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }, [searchAt]);

  const searchByQuery = useCallback(
    async (query: string) => {
      setState({ status: "loading" });
      try {
        const location = await fetchGeocode(query);
        await searchAt(location.lat, location.lng);
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Location search failed, please try again.",
        });
      }
    },
    [searchAt],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Finding places near you…</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>{state.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => void load()}>
          <Text style={styles.buttonText}>📍 Use my location</Text>
        </Pressable>
        <LocationSearchForm onSearch={searchByQuery} />
      </View>
    );
  }

  if (state.places.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        {(["list", "map"] as const).map((v) => (
          <Pressable
            key={v}
            style={[styles.toggle, view === v && styles.toggleActive]}
            onPress={() => setView(v)}
          >
            <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>
              {v === "list" ? "☰ List" : "🗺 Map"}
            </Text>
          </Pressable>
        ))}
      </View>
      {view === "list" ? (
        <FlatList
          data={state.places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <PlaceCard place={item} />}
        />
      ) : (
        <View style={styles.mapContainer}>
          <ResultsMapView places={state.places} center={state.center} />
        </View>
      )}
    </View>
  );
}

function LocationSearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const submit = () => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed);
  };

  return (
    <View style={styles.searchForm}>
      <Text style={styles.searchLabel}>Or search by city or ZIP / PIN code</Text>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="e.g. Bengaluru, Mumbai, 10036, 560034"
        returnKeyType="search"
        onSubmitEditing={submit}
      />
      <Pressable style={styles.searchButton} onPress={submit}>
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
    </View>
  );
}

function openStatus(place: PlaceSummary): string {
  if (place.is24Hours) return "  ·  Open 24/7";
  if (place.openNow === true) return "  ·  Open now";
  if (place.openNow === false) return "  ·  Closed now";
  return "";
}

function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.address}>{place.address}</Text>
      <Text style={styles.meta}>
        {place.distanceKm.toFixed(1)} km away
        {openStatus(place)}
        {place.isEmergency ? "  ·  Emergency care" : ""}
      </Text>
      <View style={styles.actions}>
        {place.phone && (
          <Pressable
            style={[styles.button, styles.callButton]}
            onPress={() => void Linking.openURL(telUrl(place.phone!))}
          >
            <Text style={styles.buttonText}>📞 Call</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.directionsButton]}
          onPress={() => void Linking.openURL(googleMapsDirectionsUrl(place.lat, place.lng))}
        >
          <Text style={styles.buttonText}>🧭 Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  toggle: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  toggleActive: { backgroundColor: "#54704B" },
  toggleText: { fontWeight: "600", color: "#444" },
  toggleTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  statusText: { marginTop: 12, fontSize: 16, textAlign: "center", color: "#444" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  name: { fontSize: 17, fontWeight: "700" },
  address: { marginTop: 2, color: "#666" },
  meta: { marginTop: 6, color: "#444", fontSize: 13 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12 },
  callButton: { backgroundColor: "#54704B" },
  directionsButton: { backgroundColor: "#57534E" },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#A85D4B",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchForm: { marginTop: 24, width: "100%", maxWidth: 360 },
  searchLabel: { fontWeight: "600", color: "#444", marginBottom: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchButton: {
    marginTop: 8,
    backgroundColor: "#54704B",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
