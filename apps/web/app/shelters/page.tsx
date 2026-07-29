import type { Metadata } from "next";
import { PlaceFinder } from "@/components/PlaceFinder";

export const metadata: Metadata = {
  title: "Animal shelters near me — PawConnect",
  description:
    "Find animal shelters near you for adoption, surrender, and lost-and-found help.",
};

export default function SheltersPage() {
  return (
    <div className="py-8">
      <div className="rounded-2xl border border-sage-200 border-l-4 border-l-sage-600 bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage-700">
          Shelters &amp; rescues
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
          Animal shelters near you
        </h1>
        <p className="mt-2 leading-relaxed text-stone-600">
          Adoption, surrender, and lost-and-found services in your area.
        </p>
      </div>
      <div className="mt-6">
        <PlaceFinder
          type="SHELTER"
          emptyMessage="No shelters found within 25 km. Try again or search a different area."
        />
      </div>
    </div>
  );
}
