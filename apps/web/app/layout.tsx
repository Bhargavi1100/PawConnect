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
      <body className="min-h-screen bg-orange-50/40 text-gray-900 antialiased">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <Link href="/" className="text-xl font-bold text-brand-600">
              🐾 PawConnect
            </Link>
            <div className="flex gap-2">
              <Link
                href="/emergency"
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
              >
                🚨 Emergency Vet
              </Link>
              <Link
                href="/shelters"
                className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
              >
                🏠 Shelters
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4">{children}</main>
        <footer className="mt-12 border-t bg-white p-6 text-center text-sm text-gray-500">
          PawConnect — helping pets and their people, fast.
        </footer>
      </body>
    </html>
  );
}
