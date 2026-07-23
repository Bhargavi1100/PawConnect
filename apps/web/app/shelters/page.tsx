import type { Metadata } from "next";
import { PlaceFinder } from "@/components/PlaceFinder";

export const metadata: Metadata = {
  title: "Animal shelters near me — PawConnect",
  description:
    "Find animal shelters near you for adoption, surrender, and lost-and-found help.",
};

export default function SheltersPage() {
  return (
    <div className="py-6">
      <div className="rounded-xl bg-brand-500 p-6 text-white">
        <h1 className="text-2xl font-extrabold">🏠 Animal shelters near you</h1>
        <p className="mt-1 text-orange-100">
          Adoption, surrender, and lost-and-found services in your area.
        </p>
      </div>
      <div className="mt-6">
        <PlaceFinder
          type="SHELTER"
          emptyMessage="No shelters found within 25 km. Try again or widen your search."
        />
      </div>
    </div>
  );
}
