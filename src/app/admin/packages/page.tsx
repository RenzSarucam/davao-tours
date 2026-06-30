"use client";

import { useEffect, useState } from "react";

type TourPackage = {
  id: number;
  name: string;
  destination: string;
  duration: number;
  price: number;
  description: string | null;
  includes: string | null;
  isActive: boolean;
};

const INCLUDE_OPTIONS = ["Driver", "Fuel", "Toll Fees", "Parking", "Guide", "Water", "Snacks", "Entrance Fees"];

const DESTINATIONS = [
  "Eden Nature Park", "Philippine Eagle Center", "Samal Island",
  "Mt. Apo", "Jack's Ridge", "Crocodile Park", "People's Park",
  "Malagos Garden Resort", "Pearl Farm Beach", "Davao Airport Transfer",
];

const EMPTY_FORM = {
  name: "", destination: "", duration: "", price: "",
  description: "", includes: [] as string[], isActive: true,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TourPackage | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/packages").then((r) => r.json()).then(setPackages);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (p: TourPackage) => {
    setEditing(p);
    setForm({
      name: p.name, destination: p.destination,
      duration: String(p.duration), price: String(p.price),
      description: p.description || "",
      includes: p.includes ? JSON.parse(p.includes) : [],
      isActive: p.isActive,
    });
    setShowForm(true);
  };

  const toggleInclude = (item: string) =>
    setForm((f) => ({
      ...f,
      includes: f.includes.includes(item) ? f.includes.filter((x) => x !== item) : [...f.includes, item],
    }));

  const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/packages/${editing.id}` : "/api/packages";
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
    if (!confirm("Delete this package?")) return;
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    load();
  };

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{packages.length} packages configured</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: "#00B14F" }}>
          + Add Package
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSave as never} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">{editing ? "Edit Package" : "Add Tour Package"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Package Name *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Samal Island Day Tour" required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Destination *</label>
                  <input list="dest-list" type="text" value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="Choose or type..." required className={inputClass} />
                  <datalist id="dest-list">
                    {DESTINATIONS.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (hours) *</label>
                  <input type="number" min="1" value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="8" required className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₱) *</label>
                  <input type="number" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="2500" required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">What&apos;s Included</label>
                <div className="flex flex-wrap gap-2">
                  {INCLUDE_OPTIONS.map((item) => (
                    <button key={item} type="button" onClick={() => toggleInclude(item)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                      style={form.includes.includes(item)
                        ? { background: "#00B14F", color: "#fff", borderColor: "#00B14F" }
                        : { background: "#fff", color: "#374151", borderColor: "#d1d5db" }}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description} rows={2}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about this tour package..." className={inputClass} style={{ resize: "none" }} />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                <input type="checkbox" id="active" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "#00B14F" }}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Package"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((p) => {
          const includes = p.includes ? JSON.parse(p.includes) as string[] : [];
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="p-5 border-b border-gray-50"
                style={{ background: "linear-gradient(135deg, #E8F8EE, #f0f9ff)" }}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-2 shrink-0"
                    style={p.isActive
                      ? { background: "#dcfce7", color: "#166534" }
                      : { background: "#f3f4f6", color: "#6b7280" }}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">📍 {p.destination}</p>
              </div>
              <div className="p-5">
                <div className="flex gap-4 text-sm text-gray-600 mb-3">
                  <span>⏱ {p.duration}h</span>
                  <span className="font-bold" style={{ color: "#00B14F" }}>₱{p.price.toLocaleString()}</span>
                </div>
                {includes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {includes.map((inc) => (
                      <span key={inc} className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "#E8F8EE", color: "#00803A" }}>✓ {inc}</span>
                    ))}
                  </div>
                )}
                {p.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: "#E8F8EE", color: "#00803A" }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: "#fee2e2", color: "#991b1b" }}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
        {packages.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="font-medium">No packages yet. Add your first tour!</p>
          </div>
        )}
      </div>
    </div>
  );
}