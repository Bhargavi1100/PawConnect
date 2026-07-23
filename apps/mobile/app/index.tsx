import { PlaceListScreen } from "../components/PlaceListScreen";

export default function EmergencyScreen() {
  return (
    <PlaceListScreen
      emergency
      emptyMessage="No emergency vets found within 25 km. Pull to retry or widen your search."
    />
  );
}
