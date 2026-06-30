"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Me = { name: string; role: string; email?: string } | null;

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
                {/* Avatar trigger */}
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                    style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
                    {me.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-bold text-gray-900 leading-tight">{me.name.split(" ")[0]}</div>
                    <div className="text-xs capitalize" style={{ color: "#00B14F" }}>{me.role}</div>
                  </div>
                  <span className="text-gray-400 text-xs transition-transform duration-200"
                    style={{ display: "inline-block", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▾
                  </span>
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-14 w-56 rounded-2xl shadow-2xl overflow-hidden z-50"
                      style={{ background: "#fff", border: "1px solid #e5e7eb" }}>

                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-gray-100"
                        style={{ background: "linear-gradient(135deg, #E8F8EE, #f0fdf4)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md"
                            style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
                            {me.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm leading-tight">{me.name}</div>
                            {me.email && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[130px]">{me.email}</div>}
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: "#E8F8EE", color: "#00803A" }}>
                              {me.role === "admin" ? "⚙️ Admin" : "👤 Customer"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {me.role === "admin" && (
                          <Link href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            style={{ color: "#00B14F" }}
                            onClick={() => setMenuOpen(false)}>
                            ⚙️ Admin Panel
                          </Link>
                        )}
                        <Link href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setMenuOpen(false)}>
                          ✏️ Edit Profile
                        </Link>
                        <Link href="/vehicles"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setMenuOpen(false)}>
                          🚐 Browse Vehicles
                        </Link>
                        <Link href="/booking"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setMenuOpen(false)}>
                          📋 Book a Vehicle
                        </Link>
                        <Link href="/my-bookings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setMenuOpen(false)}>
                          🗂️ My Bookings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors text-left"
                          style={{ color: "#ef4444" }}>
                          🚪 Sign Out
                        </button>
                      </div>
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