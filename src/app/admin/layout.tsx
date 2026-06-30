import { getAdminSession } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div>
      <div style={{ background: "#004d23" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <AdminNav />
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