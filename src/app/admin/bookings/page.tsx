"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Booking = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  notes: string | null;
  vehicle: { name: string; type: string };
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  confirmed: { bg: "#dcfce7", text: "#166534", label: "Confirmed" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
};

const TYPE_ICONS: Record<string, string> = {
  Van: "🚐", Coaster: "🚌", SUV: "🚙", Sedan: "🚗", Minibus: "🚎",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () =>
    fetch("/api/bookings").then((r) => r.json()).then((data) => {
      setBookings(data);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{bookings.length} total reservations</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all hover:-translate-y-0.5"
            style={filterStatus === s
              ? { background: "#0f4c81", color: "#fff", boxShadow: "0 4px 12px rgba(15,76,129,0.3)" }
              : { background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb" }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(255,255,255,0.25)" }}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const ss = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
            const icon = TYPE_ICONS[b.vehicle.type] ?? "🚗";
            const nights = Math.ceil(
              (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50"
                  style={{ background: "#f8fafc" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-gray-900 text-sm">{b.vehicle.name}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                      <span className="text-gray-400 ml-1">({nights}d)</span>
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: ss.bg, color: ss.text }}>
                    {ss.label}
                  </span>
                </div>

                <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{b.customerName}</div>
                    <div className="text-sm text-gray-500">{b.customerEmail}</div>
                    <div className="text-sm text-gray-500">{b.customerPhone}</div>
                    {b.notes && (
                      <div className="text-xs text-gray-400 mt-1">📝 {b.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold" style={{ color: "#0f4c81" }}>
                      ₱{b.totalPrice.toLocaleString()}
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap justify-end">
                      {b.status === "pending" && (
                        <button onClick={() => updateStatus(b.id, "confirmed")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5"
                          style={{ background: "#dcfce7", color: "#166534" }}>
                          ✓ Confirm
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:-translate-y-0.5"
                          style={{ background: "#fee2e2", color: "#991b1b" }}>
                          ✕ Cancel
                        </button>
                      )}
                      <button onClick={() => deleteBooking(b.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5 border border-gray-200 text-gray-500">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}