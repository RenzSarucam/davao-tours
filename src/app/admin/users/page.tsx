"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { bookings: number };
};

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false); });
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConfirmId(null);
    setDeleting(null);
    fetchCustomers();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customer Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage registered users of the platform</p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "#E8F8EE", color: "#00803A" }}>
          {customers.length} Total Users
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: "#e5e7eb" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
            onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">👤</div>
            <div className="font-semibold">No customers found</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F7F8FA", borderBottom: "1px solid #e5e7eb" }}>
                <th className="text-left px-5 py-3.5 font-bold text-gray-600">Customer</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-600 hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3.5 font-bold text-gray-600 hidden lg:table-cell">Joined</th>
                <th className="text-center px-5 py-3.5 font-bold text-gray-600">Bookings</th>
                <th className="text-center px-5 py-3.5 font-bold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}
                  className="hover:bg-gray-50 transition-colors">

                  {/* Customer info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-gray-600 hidden md:table-cell">
                    {c.phone || <span className="text-gray-300">—</span>}
                  </td>

                  {/* Joined date */}
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    {new Date(c.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </td>

                  {/* Bookings count */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: c._count.bookings > 0 ? "#E8F8EE" : "#f3f4f6",
                        color: c._count.bookings > 0 ? "#00803A" : "#9ca3af",
                      }}>
                      {c._count.bookings} {c._count.bookings === 1 ? "booking" : "bookings"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-center">
                    {confirmId === c.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: "#ef4444" }}>
                          {deleting === c.id ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(c.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ color: "#ef4444", background: "#fef2f2" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}>
                        🗑 Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}