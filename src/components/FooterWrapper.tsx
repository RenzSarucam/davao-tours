"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function FooterWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer style={{ background: "#004d23" }} className="sticky bottom-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ background: "#00B14F" }}>DT</span>
            <span className="text-white font-bold text-sm">Davao Tours</span>
          </Link>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            © 2026 Davao Tours. Premium vehicle rentals in Davao City.
          </p>
        </div>
      </div>
    </footer>
  );
}