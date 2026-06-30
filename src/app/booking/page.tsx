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

type Driver = {
  id: number;
  name: string;
  phone: string;
  experience: number;
  status: string;
  notes?: string | null;
};

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

  // Driver options
  const [needsDriver, setNeedsDriver] = useState<boolean | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [licenseHolderName, setLicenseHolderName] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string>("");
  const [uploadingLicense, setUploadingLicense] = useState(false);

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
    fetch("/api/drivers").then(r => r.json())
      .then((data: Driver[]) => setAvailableDrivers(data.filter(d => d.status === "available")));
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === Number(form.vehicleId));
  const days = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
    : 0;
  const totalPrice = selectedVehicle ? selectedVehicle.pricePerDay * days : 0;

  const handleLicenseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseFile(file);
    setLicensePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (needsDriver === null) {
      setError("Please select if you need a driver or not.");
      return;
    }

    if (needsDriver && !selectedDriverId) {
      setError("Please select a driver.");
      return;
    }

    if (!needsDriver && !licenseHolderName.trim()) {
      setError("Please enter the name on your driver's license.");
      return;
    }

    if (!needsDriver && !licenseFile) {
      setError("Please upload a photo of your driver's license.");
      return;
    }

    setSubmitting(true);

    // Upload license image first if self-drive
    let licenseImageUrl = "";
    if (!needsDriver && licenseFile) {
      setUploadingLicense(true);
      const fd = new FormData();
      fd.append("file", licenseFile);
      const upRes = await fetch("/api/upload/license", { method: "POST", body: fd });
      const upData = await upRes.json();
      setUploadingLicense(false);
      if (!upRes.ok) {
        setError(upData.error || "Failed to upload license image.");
        setSubmitting(false);
        return;
      }
      licenseImageUrl = upData.url;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        needsDriver,
        assignedDriverId: needsDriver ? selectedDriverId : undefined,
        licenseHolderName: needsDriver ? undefined : licenseHolderName,
        licenseImageUrl: needsDriver ? undefined : licenseImageUrl,
      }),
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
          <p className="text-gray-500 mb-2 leading-relaxed">
            Your reservation is pending confirmation. Our team will contact you shortly.
          </p>
          {needsDriver && (
            <p className="text-sm font-medium mb-6" style={{ color: "#00803A" }}>
              🧑‍✈️ A driver will be assigned to your booking.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/vehicles")}
              className="px-6 py-3 rounded-full font-bold text-sm text-white btn-green">
              Browse More
            </button>
            <button onClick={() => {
              setSuccess(false);
              setNeedsDriver(null);
              setLicenseHolderName("");
              setLicenseFile(null);
              setLicensePreview("");
              setForm({ vehicleId: "", customerName: me?.name || "", customerEmail: me?.email || "", customerPhone: "", startDate: "", endDate: "", notes: "" });
            }}
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

          {/* Step 1: Vehicle & Dates */}
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

          {/* Step 2: Customer Info */}
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

          {/* Step 3: Driver Option */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#00B14F" }}>3</div>
              <h2 className="font-bold text-gray-900">Driver Option</h2>
            </div>

            <p className="text-sm text-gray-500 mb-4">Do you need us to provide a driver for your trip?</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* With Driver */}
              <button type="button" onClick={() => setNeedsDriver(true)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center"
                style={{
                  borderColor: needsDriver === true ? "#00B14F" : "#e5e7eb",
                  background: needsDriver === true ? "#E8F8EE" : "#fff",
                }}>
                <span className="text-3xl">🧑‍✈️</span>
                <span className="font-bold text-gray-900 text-sm">Yes, provide a driver</span>
                <span className="text-xs text-gray-400">We will assign an available driver</span>
                {needsDriver === true && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#00B14F", color: "#fff" }}>Selected ✓</span>
                )}
              </button>

              {/* Self Drive */}
              <button type="button" onClick={() => setNeedsDriver(false)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center"
                style={{
                  borderColor: needsDriver === false ? "#00B14F" : "#e5e7eb",
                  background: needsDriver === false ? "#E8F8EE" : "#fff",
                }}>
                <span className="text-3xl">🚗</span>
                <span className="font-bold text-gray-900 text-sm">No, I will drive</span>
                <span className="text-xs text-gray-400">Upload your driver's license for verification</span>
                {needsDriver === false && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#00B14F", color: "#fff" }}>Selected ✓</span>
                )}
              </button>
            </div>

            {/* Self-drive fields */}
            {needsDriver === false && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name on Driver's License
                  </label>
                  <input
                    type="text"
                    value={licenseHolderName}
                    onChange={e => setLicenseHolderName(e.target.value)}
                    placeholder="As printed on your license"
                    className={inp}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Driver's License Photo
                  </label>
                  <label
                    className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all py-6"
                    style={{ borderColor: licensePreview ? "#00B14F" : "#d1d5db", background: licensePreview ? "#E8F8EE" : "#fafafa" }}>
                    {licensePreview ? (
                      <img src={licensePreview} alt="License preview"
                        className="max-h-40 rounded-lg object-contain" />
                    ) : (
                      <>
                        <span className="text-3xl">📄</span>
                        <span className="text-sm font-semibold text-gray-600">Click to upload license photo</span>
                        <span className="text-xs text-gray-400">JPG, PNG or WEBP — max 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLicenseFile} />
                  </label>
                  {licensePreview && (
                    <button type="button" onClick={() => { setLicenseFile(null); setLicensePreview(""); }}
                      className="text-xs text-red-400 hover:text-red-600 mt-1">
                      ✕ Remove photo
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Driver selection cards */}
            {needsDriver === true && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">Select a Driver</p>
                {availableDrivers.length === 0 ? (
                  <div className="rounded-xl p-4 text-center text-sm text-gray-400"
                    style={{ background: "#fafafa", border: "1.5px dashed #e5e7eb" }}>
                    No drivers available at the moment. Please try again later.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableDrivers.map(driver => (
                      <button key={driver.id} type="button"
                        onClick={() => setSelectedDriverId(driver.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                        style={{
                          borderColor: selectedDriverId === driver.id ? "#00B14F" : "#e5e7eb",
                          background: selectedDriverId === driver.id ? "#E8F8EE" : "#fff",
                        }}>
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow"
                          style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
                          {driver.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-sm">{driver.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{driver.phone}</div>
                          {driver.notes && (
                            <div className="text-xs text-gray-400 truncate">{driver.notes}</div>
                          )}
                        </div>
                        {/* Experience badge */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ background: "#E8F8EE", color: "#00803A" }}>
                            {driver.experience} yr{driver.experience !== 1 ? "s" : ""}
                          </span>
                          {selectedDriverId === driver.id && (
                            <span className="text-xs font-bold" style={{ color: "#00B14F" }}>✓ Selected</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl px-5 py-4 text-sm font-medium"
              style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-green">
            {uploadingLicense ? "Uploading license…" : submitting ? "Submitting…" : "Submit Booking →"}
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