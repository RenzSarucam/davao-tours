"use client";

import { useEffect, useState } from "react";

type Vehicle = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  plateNumber: string;
  color: string | null;
  year: number | null;
  description: string | null;
  amenities: string | null;
  isAvailable: boolean;
};

const VEHICLE_TYPES = ["Van", "Coaster", "SUV", "Sedan", "Minibus", "Pickup", "Motorcycle"];
const AMENITY_OPTIONS = ["Air-con", "WiFi", "TV/DVD", "Bluetooth", "Reclining Seats", "Tinted Windows", "Dash Cam", "First Aid Kit", "Cooler/Ref"];

const EMPTY_FORM = {
  name: "", type: "Van", capacity: "", pricePerDay: "",
  plateNumber: "", color: "", year: "", description: "",
  amenities: [] as string[], isAvailable: true,
};

const TYPE_ICONS: Record<string, string> = {
  Van: "🚐", Coaster: "🚌", SUV: "🚙", Sedan: "🚗",
  Minibus: "🚎", Pickup: "🛻", Motorcycle: "🏍️",
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => fetch("/api/vehicles").then((r) => r.json()).then(setVehicles);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name, type: v.type, capacity: String(v.capacity),
      pricePerDay: String(v.pricePerDay), plateNumber: v.plateNumber,
      color: v.color || "", year: v.year ? String(v.year) : "",
      description: v.description || "",
      amenities: v.amenities ? JSON.parse(v.amenities) : [],
      isAvailable: v.isAvailable,
    });
    setShowForm(true);
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/vehicles/${editing.id}` : "/api/vehicles";
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
    if (!confirm("Delete this vehicle?")) return;
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = vehicles.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicles registered</p>
        </div>
        <button onClick={openCreate}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: "#0f4c81" }}>
          + Add Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, plate, or type..."
          className="w-full max-w-sm rounded-xl px-4 py-2.5 text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white" />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSave}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">
                {editing ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Toyota Hi-Ace Super Grandia" required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                      {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Capacity (pax) *</label>
                    <input type="number" min="1" value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price Per Day (₱) *</label>
                    <input type="number" min="0" value={form.pricePerDay}
                      onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Plate Number *</label>
                    <input type="text" value={form.plateNumber}
                      onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                      placeholder="DAV-1234" required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
                    <input type="text" value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder="White, Silver..." className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                    <input type="number" value={form.year} min="2000" max="2030"
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      placeholder="2022" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                      style={form.amenities.includes(a)
                        ? { background: "#0f4c81", color: "#fff", borderColor: "#0f4c81" }
                        : { background: "#fff", color: "#374151", borderColor: "#d1d5db" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description} rows={2}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details about this vehicle..."
                  className={inputClass} style={{ resize: "none" }} />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                <input type="checkbox" id="avail" checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <label htmlFor="avail" className="text-sm font-medium text-gray-700">
                  Available for booking
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: "#0f4c81" }}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Vehicle"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
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
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Vehicle</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Specs</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Amenities</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Price/Day</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((v) => {
              const amenities = v.amenities ? JSON.parse(v.amenities) as string[] : [];
              return (
                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TYPE_ICONS[v.type] ?? "🚗"}</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{v.name}</div>
                        <div className="text-xs text-gray-400">{v.plateNumber} {v.color ? `· ${v.color}` : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{v.type}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <div>{v.capacity} pax</div>
                    {v.year && <div className="text-xs text-gray-400">Year {v.year}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {amenities.slice(0, 3).map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#dbeafe", color: "#1d4ed8" }}>{a}</span>
                      ))}
                      {amenities.length > 3 && (
                        <span className="text-xs text-gray-400">+{amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-sm" style={{ color: "#0f4c81" }}>
                    ₱{v.pricePerDay.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={v.isAvailable
                        ? { background: "#dcfce7", color: "#166534" }
                        : { background: "#fee2e2", color: "#991b1b" }}>
                      {v.isAvailable ? "✓ Available" : "✗ Unavailable"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(v)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg mr-2 transition-all hover:-translate-y-0.5"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                      style={{ background: "#fee2e2", color: "#991b1b" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🚐</div>
            <p className="font-medium">No vehicles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}