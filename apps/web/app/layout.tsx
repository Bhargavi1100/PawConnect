import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawConnect — Emergency vet care & animal shelters near you",
  description:
    "Instantly find the nearest open vet hospital during an emergency, or discover animal shelters near you for adoption, surrender, and lost-and-found help.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50 text-stone-800 antialiased">
        <header className="border-b border-cream-200 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="rounded-full bg-blush-100 px-2 py-1 text-base">🐾</span>
              <span className="text-stone-800">PawConnect</span>
            </Link>
            <div className="flex gap-2">
              <Link
                href="/emergency"
                className="rounded-full border border-clay-200 bg-clay-50 px-4 py-2 text-sm font-semibold text-clay-700 transition-colors hover:bg-clay-100"
              >
                Emergency vet
              </Link>
              <Link
                href="/shelters"
                className="rounded-full border border-sage-200 bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-700 transition-colors hover:bg-sage-100"
              >
                Shelters
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-4">{children}</main>
        <footer className="mt-16 border-t border-cream-200 bg-white px-6 py-8 text-center text-sm text-stone-500">
          PawConnect — helping pets and their people, fast.
        </footer>
      </body>
    </html>
  );
}
