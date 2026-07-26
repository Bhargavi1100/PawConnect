import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import {
  googleMapsDirectionsUrl,
  telUrl,
  type PlaceSummary,
  type PlaceType,
} from "@pawconnect/shared";
import { fetchNearby } from "../lib/api";

type Props = {
  type?: PlaceType;
  emergency?: boolean;
  emptyMessage: string;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; places: PlaceSummary[] };

export function PlaceListScreen({ type, emergency, emptyMessage }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState({
          status: "error",
          message: "Location permission is required to find places near you.",
        });
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const data = await fetchNearby({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        type,
        emergency,
      });
      setState({ status: "ready", places: data.results });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }, [type, emergency]);

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
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
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
    <FlatList
      data={state.places}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <PlaceCard place={item} />}
    />
  );
}

function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.address}>{place.address}</Text>
      <Text style={styles.meta}>
        {place.distanceKm.toFixed(1)} km away
        {place.is24Hours ? "  ·  Open 24/7" : ""}
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
  callButton: { backgroundColor: "#16a34a" },
  directionsButton: { backgroundColor: "#2563eb" },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
