import Link from "next/link";
import { Clock, MapPin, PhoneCall } from "lucide-react";
import { PawIcon } from "@/components/PawIcon";

export default function HomePage() {
  return (
    <div className="py-14">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blush-100 px-4 py-1.5 text-sm font-medium text-stone-600">
          <PawIcon className="h-4 w-4" />
          Care for your pet, wherever you are
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Help for your pet, <span className="text-sage-700">right when it matters.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
          PawConnect finds the nearest open vet hospital in an emergency and
          connects you with animal shelters in your neighborhood.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/emergency"
            className="w-full rounded-xl bg-clay-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-clay-700 sm:w-auto"
          >
            Find emergency vet care
          </Link>
          <Link
            href="/shelters"
            className="w-full rounded-xl border border-sage-200 bg-white px-8 py-4 text-lg font-semibold text-sage-700 shadow-sm transition-colors hover:bg-sage-50 sm:w-auto"
          >
            Find animal shelters
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-4xl gap-5 sm:grid-cols-3">
        {[
          {
            icon: MapPin,
            title: "Near you",
            body: "Uses your location — or a city/PIN you type — to surface the closest options, sorted by distance.",
          },
          {
            icon: Clock,
            title: "Open now",
            body: "Hours are checked in each place's own timezone, so you only head somewhere that can see you.",
          },
          {
            icon: PhoneCall,
            title: "One tap to act",
            body: "Call or get directions with a single tap — no digging through search results under stress.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
          >
            <div className="inline-flex rounded-xl bg-cream-100 p-3">
              <f.icon className="h-6 w-6 text-sage-700" strokeWidth={2} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-stone-900">{f.title}</h2>
            <p className="mt-2 leading-relaxed text-stone-600">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
