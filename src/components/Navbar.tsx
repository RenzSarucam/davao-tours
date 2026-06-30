"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Me = { name: string; role: string } | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => setMe(data));
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register") return null;

  return (
    <nav style={{ background: "#fff", borderBottom: "1.5px solid #e5e7eb" }}
      className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl"
            style={{ color: "#00B14F" }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: "#00B14F" }}>DT</span>
            Davao Tours
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/vehicles", label: "Vehicles" },
              { href: "/packages", label: "Tour Packages" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  color: pathname === href ? "#00B14F" : "#374151",
                  background: pathname === href ? "#E8F8EE" : "transparent",
                  fontWeight: pathname === href ? 700 : 500,
                }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {me ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all"
                  style={{ borderColor: "#00B14F", color: "#00B14F" }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#00B14F" }}>
                    {me.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold hidden sm:block">{me.name.split(" ")[0]}</span>
                  <span className="text-xs">▾</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-semibold text-gray-900 text-sm">{me.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{me.role}</div>
                      </div>
                      {me.role === "admin" && (
                        <Link href="/admin"
                          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
                          style={{ color: "#00B14F" }}
                          onClick={() => setMenuOpen(false)}>
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <Link href="/my-bookings"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}>
                        📋 My Bookings
                      </Link>
                      <div className="border-t border-gray-100" />
                      <button onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        🚪 Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                  style={{ borderColor: "#00B14F", color: "#00B14F" }}>
                  Log In
                </Link>
                <Link href="/register"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white btn-green">
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}