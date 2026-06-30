import { getAdminSession } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  const navItems = [
    { href: "/admin",          label: "Dashboard" },
    { href: "/admin/vehicles", label: "Fleet" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/drivers",  label: "Drivers" },
    { href: "/admin/packages", label: "Tour Packages" },
  ];

  return (
    <div>
      <div style={{ background: "#004d23" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="py-3 pr-3 border-r border-green-800">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: "#00B14F", color: "#fff" }}>DT</span>
              </Link>
              <nav className="flex items-center gap-1 overflow-x-auto">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}
                    className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200"
                    style={{ color: "#86efac" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#86efac";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <AdminHeader name={session?.name ?? "Admin"} />
          </div>
        </div>
      </div>
      <div style={{ background: "#F7F8FA", minHeight: "calc(100vh - 48px)" }}>
        {children}
      </div>
    </div>
  );
}