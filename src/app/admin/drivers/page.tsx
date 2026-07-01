"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  customerName: string;
  status: string;
  vehicle: { name: string; type: string };
};

type Driver = {
  id: number;
  name: string;
  phone: string;
  licenseNo: string;
  experience: number;
  status: string;
  realStatus: string;
  notes: string | null;
  bookings: Booking[];
};

const REAL_STATUS: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  available: { bg: "#dcfce7", text: "#166534", label: "Available", dot: "#22c55e" },
  "on-duty":  { bg: "#fef3c7", text: "#92400e", label: "On Duty",   dot: "#f59e0b" },
  off:        { bg: "#f3f4f6", text: "#6b7280", label: "Day Off",   dot: "#9ca3af" },
};

const BOOKING_STATUS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dcfce7", text: "#166534" },
};

const EMPTY_FORM = { name: "", phone: "", licenseNo: "", experience: "", status: "available", notes: "" };

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = () =>
    fetch("/api/admin/drivers").then(r => r.json()).then(data => {
      setDrivers(Array.isArray(data) ? data : []);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({ name: d.name, phone: d.phone, licenseNo: d.licenseNo,
      experience: String(d.experience), status: d.status, notes: d.notes || "" });
    setShowForm(true);
  };

  const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/drivers/${editing.id}` : "/api/drivers";
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this driver?")) return;
    await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    load();
  };

  const inp = "w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-50 outline-none bg-white transition-all";

  const counts = {
    available: drivers.filter(d => d.realStatus === "available").length,
    onDuty:    drivers.filter(d => d.realStatus === "on-duty").length,
    off:       drivers.filter(d => d.realStatus === "off").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} drivers registered</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: "#00B14F" }}>
          + Add Driver
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available",  count: counts.available, icon: "✅", ...REAL_STATUS.available },
          { label: "On Duty",    count: counts.onDuty,    icon: "🚐", ...REAL_STATUS["on-duty"] },
          { label: "Day Off",    count: counts.off,        icon: "💤", ...REAL_STATUS.off },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{s.count}</div>
              <div className="text-xs font-semibold" style={{ color: s.text }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Driver cards with schedule */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map(d => {
            const rs = REAL_STATUS[d.realStatus] ?? REAL_STATUS.available;
            const isExpanded = expandedId === d.id;
            const upcomingCount = d.bookings.length;

            return (
              <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Driver row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                    style={{ background: "#00B14F" }}>
                    {d.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{d.name}</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: rs.bg, color: rs.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: rs.dot }} />
                        {rs.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {d.phone} · {d.licenseNo} · {d.experience} yrs exp
                    </div>
                    {d.notes && <div className="text-xs text-gray-400 mt-0.5 italic">{d.notes}</div>}
                  </div>

                  {/* Schedule toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : d.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: upcomingCount > 0 ? "#E8F8EE" : "#f3f4f6",
                      color: upcomingCount > 0 ? "#00803A" : "#6b7280",
                    }}>
                    📅 {upcomingCount > 0 ? `${upcomingCount} booking${upcomingCount > 1 ? "s" : ""}` : "No schedule"}
                    <span className="ml-0.5">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(d)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}>Edit</button>
                    <button onClick={() => handleDelete(d.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "#fee2e2", color: "#991b1b" }}>Delete</button>
                  </div>
                </div>

                {/* Schedule panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4" style={{ background: "#f8fafc" }}>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Upcoming Bookings / Schedule
                    </div>
                    {d.bookings.length === 0 ? (
                      <div className="text-sm text-gray-400 py-3 text-center">
                        🗓️ No upcoming bookings — driver is free
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {d.bookings.map(b => {
                          const bs = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pending;
                          const start = new Date(b.startDate);
                          const end = new Date(b.endDate);
                          const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isActive = start <= today && end >= today;

                          return (
                            <div key={b.id}
                              className="flex items-center gap-3 p-3 rounded-xl border"
                              style={{
                                background: isActive ? "#E8F8EE" : "#fff",
                                borderColor: isActive ? "#86efac" : "#e5e7eb",
                              }}>
                              {/* Date bar */}
                              <div className="flex-shrink-0 text-center w-16">
                                <div className="text-xs font-bold text-gray-900">
                                  {format(start, "MMM d")}
                                </div>
                                <div className="text-xs text-gray-400">→</div>
                                <div className="text-xs font-bold text-gray-900">
                                  {format(end, "MMM d")}
                                </div>
                              </div>

                              {/* Divider */}
                              <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

                              {/* Trip info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm">{b.customerName}</div>
                                <div className="text-xs text-gray-400">
                                  {b.vehicle.name} · {days} day{days > 1 ? "s" : ""}
                                </div>
                              </div>

                              {/* Status + active badge */}
                              <div className="flex flex-col items-end gap-1">
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                                  style={{ background: bs.bg, color: bs.text }}>
                                  {b.status}
                                </span>
                                {isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{ background: "#fef3c7", color: "#92400e" }}>
                                    🚐 On Duty Today
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {drivers.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">👨‍✈️</div>
              <p className="font-medium text-gray-500">No drivers yet. Add one!</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave as never} className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing ? "Edit Driver" : "Add Driver"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Dela Cruz" required className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="09XXXXXXXXX" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">License No. *</label>
                  <input type="text" value={form.licenseNo} onChange={e => setForm({ ...form, licenseNo: e.target.value.toUpperCase() })}
                    placeholder="N01-23-456789" required className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Experience (years)</label>
                  <input type="number" min="0" value={form.experience}
                    onChange={e => setForm({ ...form, experience: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inp}>
                    <option value="available">Available</option>
                    <option value="off">Day Off</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-0.5">On Duty is auto-detected from bookings</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} rows={2} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional info..." className={inp} style={{ resize: "none" }} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#00B14F" }}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Driver"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}