import { PlaceListScreen } from "../components/PlaceListScreen";

export default function SheltersScreen() {
  return (
    <PlaceListScreen
      type="SHELTER"
      emptyMessage="No shelters found within 25 km."
    />
  );
}
