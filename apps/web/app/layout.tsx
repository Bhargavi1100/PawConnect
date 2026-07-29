import type { Metadata } from "next";
import Link from "next/link";
import { PawIcon } from "@/components/PawIcon";
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
          <nav className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-100">
                <PawIcon className="h-5 w-5" />
              </span>
              <span className="text-stone-800">PawConnect</span>
            </Link>
            <div className="flex gap-2.5">
              <Link
                href="/emergency"
                className="whitespace-nowrap rounded-full border border-clay-200 bg-clay-50 px-4 py-2 text-sm font-semibold text-clay-700 transition-colors hover:bg-clay-100"
              >
                Emergency vet
              </Link>
              <Link
                href="/shelters"
                className="whitespace-nowrap rounded-full border border-sage-200 bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-700 transition-colors hover:bg-sage-100"
              >
                Shelters
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-4 sm:px-6">{children}</main>
        <footer className="mt-16 border-t border-cream-200 bg-white px-6 py-8 text-center text-sm text-stone-500">
          PawConnect — helping pets and their people, fast.
        </footer>
      </body>
    </html>
  );
}
