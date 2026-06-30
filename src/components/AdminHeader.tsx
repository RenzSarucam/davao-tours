"use client";

import { useRouter } from "next/navigation";

export default function AdminHeader({ name }: { name: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#00B14F" }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium" style={{ color: "#86efac" }}>{name}</span>
      </div>
      <button onClick={handleLogout}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}>
        Sign Out
      </button>
    </div>
  );
}