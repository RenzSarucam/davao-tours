"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin",          label: "Dashboard" },
  { href: "/admin/vehicles", label: "Fleet" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/drivers",  label: "Drivers" },
  { href: "/admin/packages", label: "Tour Packages" },
  { href: "/admin/users",    label: "Users" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="py-3 pr-3 border-r border-green-800 flex items-center">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
          style={{ background: "#00B14F", color: "#fff" }}>DT</span>
      </Link>
      <nav className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200"
              style={{
                color: active ? "#ffffff" : "#86efac",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "#86efac";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}