import type { Metadata } from "next";
import { PlaceFinder } from "@/components/PlaceFinder";

export const metadata: Metadata = {
  title: "Emergency vet near me — PawConnect",
  description:
    "Find the nearest open emergency vet hospital right now, with one-tap call and directions.",
};

export default function EmergencyPage() {
  return (
    <div className="py-6">
      <div className="rounded-xl bg-red-600 p-6 text-white">
        <h1 className="text-2xl font-extrabold">🚨 Emergency vet care near you</h1>
        <p className="mt-1 text-red-100">
          Nearest emergency-capable vets first. If your pet's life is in danger,
          call ahead while you're on the way.
        </p>
      </div>
      <div className="mt-6">
        <PlaceFinder
          emergency
          emptyMessage="No emergency vets found within 25 km. Try again or widen your search."
        />
      </div>
    </div>
  );
}
