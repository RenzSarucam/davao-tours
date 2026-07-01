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

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash" | "bank">("cash");
  const [reservationFeeMethod, setReservationFeeMethod] = useState<"gcash" | "bank">("gcash");

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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string }[]>([]);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });

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
    // drivers fetched with date filter when user picks "Yes, provide a driver"
  }, []);

  useEffect(() => {
    if (!form.vehicleId) { setBookedRanges([]); return; }
    fetch(`/api/vehicles/availability?vehicleId=${form.vehicleId}`)
      .then(r => r.json()).then(data => setBookedRanges(Array.isArray(data) ? data : []));
  }, [form.vehicleId]);

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
        paymentMethod,
        reservationFeeMethod,
      }),
    });

    if (res.ok) {
      const bookingData = await res.json();
      setBookingId(bookingData.id);
      setSuccess(true);
    } else {
      try {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      } catch {
        setError(`Server error (${res.status}). Please try again.`);
      }
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
    const reseFee = Math.round(totalPrice * 0.30);
    const remBalance = totalPrice - reseFee;

    // Step A — QR + Screenshot upload
    if (!proofSubmitted) {
      return (
        <div className="px-4 py-8" style={{ background: "#F7F8FA" }}>
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: "#dcfce7" }}>✅</div>
              <h2 className="text-xl font-extrabold text-gray-900">Booking Submitted!</h2>
              <p className="text-gray-500 text-sm mt-1">Pay the reservation fee to confirm your slot.</p>
            </div>

            {/* Fee amount */}
            <div className="text-center mb-4">
              <div className="text-xs font-semibold text-gray-400 mb-0.5">Reservation Fee (30%)</div>
              <div className="text-4xl font-black" style={{ color: "#00B14F" }}>₱{reseFee.toLocaleString()}</div>
            </div>

            {/* QR Card */}
            {reservationFeeMethod === "gcash" ? (
              <div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ background: "#0070e0" }}>
                <div className="px-5 pt-4 pb-3 flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-black text-sm" style={{ color: "#0070e0" }}>G</div>
                  <span className="text-white font-black text-lg">GCash</span>
                </div>
                <div className="mx-4 mb-4 bg-white rounded-2xl p-4 flex flex-col items-center shadow">
                  <img src="/qr/gcashqr.png" alt="GCash QR" className="w-52 h-52 object-cover rounded-xl mb-2" />
                  <p className="text-xs text-gray-400">Transfer fees may apply.</p>
                  <p className="font-black text-sm mt-1" style={{ color: "#0070e0" }}>Renz Carl</p>
                  <p className="text-xs text-gray-400">Mobile No.: 0926 673 ••••</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ background: "#fff", border: "3px solid #c0392b" }}>
                <div className="pt-4 pb-2 flex flex-col items-center">
                  <span className="font-black text-2xl" style={{ color: "#c0392b" }}>BPI</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5">Renz</span>
                  <span className="text-xs text-gray-400">••••••••••••056</span>
                </div>
                <div className="px-8 pb-4 flex flex-col items-center">
                  <img src="/qr/bpiqr.png" alt="BPI QR" className="w-52 h-52 object-cover rounded-xl mt-2" />
                  <p className="text-xs text-gray-400 mt-2">Transfer fees may apply</p>
                </div>
              </div>
            )}

            {/* Screenshot upload */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
              <p className="text-sm font-bold text-gray-900 mb-3">📸 Upload Screenshot of Payment</p>
              <label className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all py-5"
                style={{ borderColor: proofPreview ? "#00B14F" : "#d1d5db", background: proofPreview ? "#E8F8EE" : "#fafafa" }}>
                {proofPreview ? (
                  <img src={proofPreview} alt="Proof" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-semibold text-gray-600">Tap to upload screenshot</span>
                    <span className="text-xs text-gray-400">JPG or PNG</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); }
                }} />
              </label>
              {proofPreview && (
                <button type="button" onClick={() => { setProofFile(null); setProofPreview(""); }}
                  className="text-xs text-red-400 mt-1">✕ Remove</button>
              )}
            </div>

            <div className="p-3 rounded-xl text-xs text-center mb-4"
              style={{ background: "#fef9c3", color: "#854d0e" }}>
              ⚠️ Reservation fee is <strong>non-refundable</strong>. We will verify your payment and confirm your booking.
            </div>

            <button
              disabled={uploadingProof}
              onClick={async () => {
                if (!proofFile) { alert("Please upload your payment screenshot first."); return; }
                setUploadingProof(true);
                try {
                  const fd = new FormData();
                  fd.append("file", proofFile);
                  const upRes = await fetch("/api/upload/proof", { method: "POST", body: fd });
                  const upData = await upRes.json();
                  if (!upRes.ok) { alert(upData.error || "Upload failed"); setUploadingProof(false); return; }
                  if (bookingId) {
                    await fetch(`/api/bookings/${bookingId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ proofImageUrl: upData.url }),
                    });
                  }
                } catch { /* non-critical */ }
                setUploadingProof(false);
                setProofSubmitted(true);
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm btn-green"
              style={{ opacity: uploadingProof ? 0.7 : 1 }}>
              {uploadingProof ? "Uploading..." : "I've Paid — Submit Proof →"}
            </button>
          </div>
        </div>
      );
    }

    // Step B — Remaining balance info
    return (
      <div className="px-4 py-8" style={{ background: "#F7F8FA" }}>
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
              style={{ background: "#E8F8EE" }}>🎉</div>
            <h2 className="text-xl font-extrabold text-gray-900">Proof Submitted!</h2>
            <p className="text-gray-500 text-sm mt-1">Our team will verify your payment and confirm your booking shortly.</p>
          </div>

          {/* Remaining balance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="text-xs font-semibold text-gray-400 mb-1 text-center">Remaining Balance on Pick-up</div>
            <div className="text-4xl font-black text-center mb-3" style={{ color: "#374151" }}>
              ₱{remBalance.toLocaleString()}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "💵", label: "Cash" },
                { icon: "📱", label: "GCash" },
                { icon: "🏦", label: "Bank" },
              ].map(m => (
                <div key={m.label} className="rounded-xl py-2 text-xs font-semibold text-gray-600"
                  style={{ background: "#F7F8FA" }}>
                  {m.icon} {m.label}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">Payable on the day of your trip</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push("/my-bookings")}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-white btn-green">
              My Bookings
            </button>
            <button onClick={() => {
              setSuccess(false); setProofSubmitted(false);
              setProofFile(null); setProofPreview("");
              setNeedsDriver(null); setLicenseHolderName("");
              setLicenseFile(null); setLicensePreview("");
              setForm({ vehicleId: "", customerName: me?.name || "", customerEmail: me?.email || "", customerPhone: "", startDate: "", endDate: "", notes: "" });
            }}
              className="flex-1 py-3 rounded-2xl font-bold text-sm border-2"
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

              {/* Availability calendar */}
              {form.vehicleId && (() => {
                const { year, month } = calMonth;
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const todayStr = new Date().toISOString().split("T")[0];
                const monthName = new Date(year, month).toLocaleDateString("en-PH", { month: "long", year: "numeric" });

                const isBooked = (dateStr: string) =>
                  bookedRanges.some(r => dateStr >= r.startDate.split("T")[0] && dateStr <= r.endDate.split("T")[0]);

                const isSelected = (dateStr: string) =>
                  form.startDate && form.endDate && dateStr >= form.startDate && dateStr <= form.endDate;

                return (
                  <div className="mt-2 border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Calendar header */}
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ background: "#004d23" }}>
                      <button type="button" onClick={() => setCalMonth(m => {
                        const d = new Date(m.year, m.month - 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })} className="text-white/70 hover:text-white px-2 font-bold">‹</button>
                      <span className="text-sm font-bold text-white">{monthName}</span>
                      <button type="button" onClick={() => setCalMonth(m => {
                        const d = new Date(m.year, m.month + 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })} className="text-white/70 hover:text-white px-2 font-bold">›</button>
                    </div>
                    {/* Day labels */}
                    <div className="grid grid-cols-7 bg-gray-50">
                      {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-gray-400 py-1.5">{d}</div>
                      ))}
                    </div>
                    {/* Days grid */}
                    <div className="grid grid-cols-7 bg-white p-1 gap-0.5">
                      {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                        const booked = isBooked(dateStr);
                        const selected = isSelected(dateStr);
                        const isPast = dateStr < todayStr;
                        const isToday = dateStr === todayStr;

                        return (
                          <div key={day}
                            className="aspect-square flex items-center justify-center rounded-lg text-xs font-semibold relative"
                            style={{
                              background: booked ? "#fee2e2" : selected ? "#E8F8EE" : "transparent",
                              color: booked ? "#991b1b" : selected ? "#00803A" : isPast ? "#d1d5db" : "#374151",
                              fontWeight: isToday ? "900" : undefined,
                              outline: isToday ? "2px solid #00B14F" : undefined,
                            }}>
                            {booked ? <span className="line-through opacity-60">{day}</span> : day}
                            {booked && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-red-400" style={{ fontSize: "6px" }}>●</span>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Booked
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ background: "#E8F8EE", border: "1px solid #86efac" }} /> Your selection
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-white border-2" style={{ borderColor: "#00B14F" }} /> Today
                      </span>
                    </div>
                  </div>
                );
              })()}
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
              <button type="button" onClick={() => {
                setNeedsDriver(true);
                if (form.startDate && form.endDate) {
                  const params = new URLSearchParams({ startDate: form.startDate, endDate: form.endDate });
                  fetch(`/api/drivers?${params}`).then(r => r.json())
                    .then((data: Driver[]) => setAvailableDrivers(data));
                }
              }}
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

          {/* Step 4: Payment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#00B14F" }}>4</div>
              <h2 className="font-bold text-gray-900">Payment</h2>
            </div>

            {/* Reservation Fee Breakdown */}
            {totalPrice > 0 && (
              <div className="rounded-2xl p-4 mb-5" style={{ background: "#E8F8EE", border: "1.5px solid #86efac" }}>
                <div className="text-xs font-bold mb-3" style={{ color: "#00803A" }}>💰 Payment Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Price</span>
                    <span className="font-bold text-gray-900">₱{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-green-200 pt-2">
                    <div>
                      <span className="font-bold" style={{ color: "#00803A" }}>Reservation Fee (30%)</span>
                      <div className="text-xs text-gray-400">Non-refundable · Pay now to confirm</div>
                    </div>
                    <span className="font-extrabold text-lg" style={{ color: "#00B14F" }}>
                      ₱{Math.round(totalPrice * 0.30).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Remaining Balance (70%)</span>
                      <div className="text-xs text-gray-400">Pay on pick-up</div>
                    </div>
                    <span className="font-bold text-gray-700">₱{Math.round(totalPrice * 0.70).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reservation Fee Payment Method */}
            <div className="mb-5">
              <p className="text-sm font-bold text-gray-700 mb-2">Pay Reservation Fee via:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "gcash", icon: "📱", label: "GCash", desc: "09XX-XXX-XXXX" },
                  { key: "bank",  icon: "🏦", label: "Bank Transfer", desc: "BDO / BPI / UnionBank" },
                ].map(opt => (
                  <button key={opt.key} type="button"
                    onClick={() => setReservationFeeMethod(opt.key as "gcash" | "bank")}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-center"
                    style={{
                      borderColor: reservationFeeMethod === opt.key ? "#00B14F" : "#e5e7eb",
                      background: reservationFeeMethod === opt.key ? "#E8F8EE" : "#fff",
                    }}>
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-bold text-gray-900 text-sm">{opt.label}</span>
                    <span className="text-xs text-gray-400">{opt.desc}</span>
                    {reservationFeeMethod === opt.key && (
                      <span className="text-xs font-bold" style={{ color: "#00B14F" }}>✓ Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Remaining Balance Payment */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Pay Remaining Balance on Pick-up via:</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "cash",  icon: "💵", label: "Cash" },
                  { key: "gcash", icon: "📱", label: "GCash" },
                  { key: "bank",  icon: "🏦", label: "Bank" },
                ].map(opt => (
                  <button key={opt.key} type="button"
                    onClick={() => setPaymentMethod(opt.key as "cash" | "gcash" | "bank")}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-center"
                    style={{
                      borderColor: paymentMethod === opt.key ? "#00B14F" : "#e5e7eb",
                      background: paymentMethod === opt.key ? "#E8F8EE" : "#fff",
                    }}>
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-bold text-gray-900 text-xs">{opt.label}</span>
                    {paymentMethod === opt.key && (
                      <span className="text-xs font-bold" style={{ color: "#00B14F" }}>✓</span>
                    )}
                  </button>
                ))}
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