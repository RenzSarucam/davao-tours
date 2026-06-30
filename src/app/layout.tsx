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

        <footer style={{ background: "#004d23" }} className="mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                  style={{ background: "#00B14F" }}>DT</span>
                <span className="text-white font-bold text-sm">Davao Tours</span>
              </Link>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                © 2026 Davao Tours. Premium vehicle rentals in Davao City.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}