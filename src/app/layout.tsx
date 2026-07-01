import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
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

        <FooterWrapper />
      </body>
    </html>
  );
}