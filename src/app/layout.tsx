import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Davao Tours — Vehicle Rentals",
  description: "Book vehicles for your Davao City tours and adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "#f0f4f8", color: "#1a202c" }}>
        <Navbar />

        <main className="flex-1">{children}</main>

        <footer style={{ background: "#0a3560" }} className="mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-transform duration-200 group-hover:scale-110"
                  style={{ background: "#f59e0b", color: "#0f4c81" }}
                >
                  D
                </div>
                <span className="text-white font-semibold">Davao Tours</span>
              </Link>
              <p style={{ color: "#93c5fd" }} className="text-sm">
                © 2026 Davao Tours. Premium vehicle rentals in Davao City.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}