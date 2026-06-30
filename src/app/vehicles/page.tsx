"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Vehicle = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  imageUrl: string | null;
  description: string | null;
  plateNumber: string;
  color: string | null;
  year: number | null;
  amenities: string | null;
  isAvailable: boolean;
};

const ICONS: Record<string, string> = { Van: "🚐", Coaster: "🚌", SUV: "🚙", Sedan: "🚗", Minibus: "🚎", Pickup: "🛻", Motorcycle: "🏍️" };

const TYPE_BG: Record<string, string> = {
  Van: "#dbeafe", Coaster: "#dcfce7", SUV: "#fef3c7",
  Sedan: "#f3e8ff", Minibus: "#fee2e2", Pickup: "#fef9c3", Motorcycle: "#ffedd5",
};

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [me, setMe] = useState<{ role: string } | null>(null);

  const types = ["All", ...Array.from(new Set(vehicles.map(v => v.type)))];

  useEffect(() => {
    fetch("/api/vehicles").then(r => r.json()).then(d => { setVehicles(d); setLoading(false); });
    fetch("/api/auth/me").then(r => r.json()).then(setMe);
  }, []);

  const filtered = filter === "All" ? vehicles : vehicles.filter(v => v.type === filter);

  const handleBook = (vehicleId: number) => {
    if (!me) {
      router.push(`/login?from=/booking?vehicleId=${vehicleId}`);
    } else {
      router.push(`/booking?vehicleId=${vehicleId}`);
    }
  };

  return (
    <div style={{ background: "#F7F8FA" }}>
      {/* Header */}
      <div className="py-10 px-4"
        style={{ background: "linear-gradient(160deg, #004d23 0%, #00B14F 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(255,255,255,0.6)" }}>Browse Fleet</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">Choose Your Ride</h1>
          <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm">
            {vehicles.length} vehicles available across Davao City
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={filter === t
                ? { background: "#00B14F", color: "#fff", boxShadow: "0 4px 12px rgba(0,177,79,0.3)" }
                : { background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb" }}>
              {t !== "All" && ICONS[t]} {t}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {!me && (
          <div className="mb-6 px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
            style={{ background: "#E8F8EE", border: "1.5px solid #00B14F", color: "#00803A" }}>
            <span>ℹ️</span>
            <span>You can browse freely. <strong>Log in or sign up</strong> to book a vehicle.</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No vehicles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(v => {
              const amenities: string[] = v.amenities ? JSON.parse(v.amenities) : [];
              return (
                <div key={v.id} className="vehicle-card">
                  {/* Image area */}
                  <div className="h-48 flex items-center justify-center relative"
                    style={{ background: TYPE_BG[v.type] ?? "#f3f4f6" }}>
                    <span className="text-8xl vehicle-icon drop-shadow-md">{ICONS[v.type] ?? "🚗"}</span>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={v.isAvailable
                          ? { background: "#dcfce7", color: "#166534" }
                          : { background: "#fee2e2", color: "#991b1b" }}>
                        {v.isAvailable ? "✓ Available" : "✗ Booked"}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-gray-700">
                        {v.type}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{v.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                      <span>👥 {v.capacity} pax</span>
                      {v.color && <span>🎨 {v.color}</span>}
                      {v.year && <span>📅 {v.year}</span>}
                    </div>
                    {v.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">{v.description}</p>
                    )}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {amenities.slice(0, 3).map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "#E8F8EE", color: "#00803A" }}>✓ {a}</span>
                        ))}
                        {amenities.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
                            +{amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-extrabold" style={{ color: "#00B14F" }}>
                          ₱{v.pricePerDay.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs"> /day</span>
                      </div>
                      <div className="flex gap-2">
                        {v.isAvailable && (
                          <button onClick={() => handleBook(v.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-green">
                            {me ? "Book Now" : "Log in to Book"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}