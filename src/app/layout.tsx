import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teacher Track — Qualification Progress",
  description: "Track per-teacher qualification progress across your faculty.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-[var(--color-border)] bg-[var(--background)]/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)]" />
              <span>Teacher<span className="text-[var(--color-brand-primary)]">Track</span></span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-[var(--color-panel-2)]">Dashboard</Link>
              <Link href="/manage" className="px-3 py-1.5 rounded-md hover:bg-[var(--color-panel-2)]">Manage</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
