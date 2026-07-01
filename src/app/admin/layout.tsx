import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <div style={{ background: "#004d23" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <AdminNav />
            <AdminHeader name={session?.name ?? "Admin"} />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1" style={{ background: "#F7F8FA" }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ background: "#004d23" }} className="sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{ background: "#00B14F" }}>DT</span>
              <span className="text-white font-bold text-sm">Davao Tours — Admin</span>
            </Link>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              © 2026 Davao Tours. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}