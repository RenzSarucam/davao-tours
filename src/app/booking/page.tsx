"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Vehicle = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
};

type Me = { id: number; name: string; email?: string; phone?: string } | null;

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedId = searchParams.get("vehicleId");

  const [me, setMe] = useState<Me>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    vehicleId: preselectedId || "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      setMe(data);
      setAuthChecked(true);
      if (data) {
        setForm(f => ({
          ...f,
          customerName: data.name || "",
          customerEmail: data.email || "",
          customerPhone: data.phone || "",
        }));
      }
    });
    fetch("/api/vehicles").then(r => r.json())
      .then(data => setVehicles(data.filter((v: Vehicle & { isAvailable: boolean }) => v.isAvailable)));
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === Number(form.vehicleId));
  const days = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
    : 0;
  const totalPrice = selectedVehicle ? selectedVehicle.pricePerDay * days : 0;

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
    setSubmitting(false);
  };

  const inp = "w-full rounded-xl px-4 py-3 text-gray-900 text-sm outline-none transition-all border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white";

  // Not logged in wall
  if (authChecked && !me) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background: "#F7F8FA" }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "#E8F8EE" }}>🔒</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-8">
            You need to be logged in to book a vehicle. Create a free account to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/login?from=/booking${preselectedId ? `?vehicleId=${preselectedId}` : ""}`}
              className="px-6 py-3 rounded-full font-bold text-sm text-white btn-green">
              Log In
            </Link>
            <Link href="/register"
              className="px-6 py-3 rounded-full font-bold text-sm border-2"
              style={{ borderColor: "#00B14F", color: "#00B14F" }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" style={{ background: "#F7F8FA" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "#dcfce7" }}>✅</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Submitted!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Your reservation is pending confirmation. Our team will contact you shortly.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/vehicles")}
              className="px-6 py-3 rounded-full font-bold text-sm text-white btn-green">
              Browse More
            </button>
            <button onClick={() => { setSuccess(false); setForm({ vehicleId: "", customerName: me?.name || "", customerEmail: me?.email || "", customerPhone: "", startDate: "", endDate: "", notes: "" }); }}
              className="px-6 py-3 rounded-full font-bold text-sm border-2"
              style={{ borderColor: "#00B14F", color: "#00B14F" }}>
              New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F8FA" }}>
      {/* Header */}
      <div className="py-10 px-4"
        style={{ background: "linear-gradient(160deg, #004d23 0%, #00B14F 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-1">Book a Vehicle</h1>
          <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm">
            Fill in the details below and we'll confirm your reservation.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Vehicle & Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#00B14F" }}>1</div>
              <h2 className="font-bold text-gray-900">Vehicle & Dates</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Vehicle</label>
                <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                  required className={inp} style={{ appearance: "auto" }}>
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}, {v.capacity} pax) — ₱{v.pricePerDay.toLocaleString()}/day
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    required className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate}
                    min={form.startDate || new Date().toISOString().split("T")[0]}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    required className={inp} />
                </div>
              </div>
              {selectedVehicle && days > 0 && (
                <div className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: "#E8F8EE", border: "1.5px solid #86efac" }}>
                  <div className="text-sm" style={{ color: "#00803A" }}>
                    ₱{selectedVehicle.pricePerDay.toLocaleString()} × {days} day{days > 1 ? "s" : ""}
                  </div>
                  <div className="text-xl font-extrabold" style={{ color: "#00B14F" }}>
                    ₱{totalPrice.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#00B14F" }}>2</div>
              <h2 className="font-bold text-gray-900">Your Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Juan dela Cruz" required className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={form.customerEmail}
                    onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="juan@email.com" required className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.customerPhone}
                    onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="09XXXXXXXXX" required className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notes <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea value={form.notes} rows={3}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Pickup location, special requests..."
                  className={inp} style={{ resize: "none" }} />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-5 py-4 text-sm font-medium"
              style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-green">
            {submitting ? "Submitting…" : "Submit Booking →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400"><div className="text-4xl mb-3">⏳</div><p>Loading...</p></div>}>
      <BookingForm />
    </Suspense>
  );
}