"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeader({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
        style={{ background: open ? "rgba(255,255,255,0.12)" : "transparent" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.background = open ? "rgba(255,255,255,0.12)" : "transparent")}>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
          {name.charAt(0).toUpperCase()}
        </div>
        {/* Name */}
        <span className="text-sm font-semibold hidden sm:block" style={{ color: "#86efac" }}>
          {name.split(" ")[0]}
        </span>
        {/* Arrow */}
        <span className="text-xs transition-transform duration-200"
          style={{ color: "#86efac", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100"
              style={{ background: "linear-gradient(135deg, #E8F8EE, #f0fdf4)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shadow"
                  style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{name}</div>
                  <div className="text-xs font-medium" style={{ color: "#00B14F" }}>Administrator</div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => { setOpen(false); router.push("/admin"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                <span>📊</span> Dashboard
              </button>
              <button
                onClick={() => { setOpen(false); router.push("/"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                <span>🌐</span> View Site
              </button>
            </div>

            <div className="border-t border-gray-100 py-1">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 transition-colors text-left"
                style={{ color: "#ef4444" }}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}