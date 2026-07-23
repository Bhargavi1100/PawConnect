import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Help for your pet, <span className="text-brand-600">right now.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          PawConnect finds the nearest open vet hospital in an emergency and
          connects you with animal shelters in your neighborhood.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/emergency"
            className="w-full rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-700 sm:w-auto"
          >
            🚨 Find Emergency Vet Care
          </Link>
          <Link
            href="/shelters"
            className="w-full rounded-xl bg-brand-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-brand-600 sm:w-auto"
          >
            🏠 Find Animal Shelters
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          {
            emoji: "📍",
            title: "Near you",
            body: "Uses your location to surface the closest options, sorted by real distance.",
          },
          {
            emoji: "🕐",
            title: "Open now",
            body: "Emergency results prioritize 24/7 hospitals and clinics that can see you immediately.",
          },
          {
            emoji: "📞",
            title: "One tap to act",
            body: "Call or get Google Maps directions with a single tap — no digging through search results.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-3xl">{f.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold">{f.title}</h2>
            <p className="mt-1 text-gray-600">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
