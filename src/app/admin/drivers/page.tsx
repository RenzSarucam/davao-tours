"use client";

import { useEffect, useState } from "react";

type Driver = {
  id: number;
  name: string;
  phone: string;
  licenseNo: string;
  experience: number;
  status: string;
  notes: string | null;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  available: { bg: "#dcfce7", text: "#166534" },
  "on-duty":  { bg: "#fef3c7", text: "#92400e" },
  off:        { bg: "#f3f4f6", text: "#6b7280" },
};

const EMPTY_FORM = {
  name: "", phone: "", licenseNo: "", experience: "", status: "available", notes: "",
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/drivers").then((r) => r.json()).then(setDrivers);
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

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all";

  const counts = {
    available: drivers.filter((d) => d.status === "available").length,
    onDuty:    drivers.filter((d) => d.status === "on-duty").length,
    off:       drivers.filter((d) => d.status === "off").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} drivers registered</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: "#0f4c81" }}>
          + Add Driver
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available", count: counts.available, bg: "#dcfce7", text: "#166534", icon: "✅" },
          { label: "On Duty",   count: counts.onDuty,   bg: "#fef3c7", text: "#92400e", icon: "🚐" },
          { label: "Day Off",   count: counts.off,      bg: "#f3f4f6", text: "#6b7280", icon: "💤" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-extrabold" style={{ color: "#0f4c81" }}>{s.count}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Dela Cruz" required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09XXXXXXXXX" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">License No. *</label>
                  <input type="text" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value.toUpperCase() })}
                    placeholder="N01-23-456789" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Experience (years)</label>
                  <input type="number" min="0" value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    <option value="available">Available</option>
                    <option value="on-duty">On Duty</option>
                    <option value="off">Day Off</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} rows={2}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional info..." className={inputClass} style={{ resize: "none" }} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "#0f4c81" }}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Driver"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead style={{ background: "#f8fafc" }}>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Driver</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">License No.</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Experience</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {drivers.map((d) => {
              const sc = STATUS_COLORS[d.status] ?? STATUS_COLORS.off;
              return (
                <tr key={d.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "#0f4c81" }}>
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{d.name}</div>
                        <div className="text-xs text-gray-400">{d.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{d.licenseNo}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{d.experience} yr{d.experience !== 1 ? "s" : ""}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                      style={{ background: sc.bg, color: sc.text }}>
                      {d.status === "on-duty" ? "On Duty" : d.status === "off" ? "Day Off" : "Available"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(d)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg mr-2 transition-all hover:-translate-y-0.5"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}>Edit</button>
                    <button onClick={() => handleDelete(d.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                      style={{ background: "#fee2e2", color: "#991b1b" }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {drivers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">👨‍✈️</div>
            <p className="font-medium">No drivers yet. Add one!</p>
          </div>
        )}
      </div>
    </div>
  );
}