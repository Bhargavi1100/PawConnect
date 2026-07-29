import type { Metadata } from "next";
import { PlaceFinder } from "@/components/PlaceFinder";

export const metadata: Metadata = {
  title: "Emergency vet near me — PawConnect",
  description:
    "Find the nearest open emergency vet hospital right now, with one-tap call and directions.",
};

export default function EmergencyPage() {
  return (
    <div className="py-8">
      <div className="rounded-2xl border border-clay-200 border-l-4 border-l-clay-600 bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-clay-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-clay-700">
          Urgent care
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
          Emergency vet care near you
        </h1>
        <p className="mt-2 leading-relaxed text-stone-600">
          The nearest emergency-capable vets, closest first. If your pet's life
          is in danger, call ahead while you're on the way — they can prepare
          for your arrival.
        </p>
      </div>
      <div className="mt-6">
        <PlaceFinder
          emergency
          emptyMessage="No emergency vets found within 25 km. Try again or search a different area."
        />
      </div>
    </div>
  );
}
