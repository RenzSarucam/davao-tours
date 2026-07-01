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
  reservationFee: number;
  remainingBalance: number;
  reservationFeePaid: boolean;
  reservationFeeMethod: string | null;
  proofImageUrl: string | null;
  paymentMethod: string;
  status: string;
  notes: string | null;
  needsDriver: boolean;
  licenseHolderName: string | null;
  vehicle: { name: string; type: string };
  assignedDriver: { name: string; phone: string } | null;
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  confirmed: { bg: "#dcfce7", text: "#166534", label: "Confirmed" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
  completed: { bg: "#ede9fe", text: "#5b21b6", label: "Completed" },
};

const TYPE_ICONS: Record<string, string> = {
  Van: "🚐", Coaster: "🚌", SUV: "🚙", Sedan: "🚗", Minibus: "🚎",
};

const METHOD_LABEL: Record<string, string> = {
  gcash: "GCash", bank: "Bank Transfer", cash: "Cash",
};

function BookingTimer({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [display, setDisplay] = useState("");
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"waiting"|"active"|"ended">("waiting");

  useEffect(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const total = end - start;

    const tick = () => {
      const now = Date.now();
      if (now < start) {
        const diff = start - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        setDisplay(`Starts in ${d}d ${String(h).padStart(2,"0")}h ${String(min).padStart(2,"0")}m`);
        setPct(0); setPhase("waiting");
      } else if (now <= end) {
        const remaining = end - now;
        const elapsed = now - start;
        const d = Math.floor(remaining / 86400000);
        const h = Math.floor((remaining % 86400000) / 3600000);
        const min = Math.floor((remaining % 3600000) / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        setDisplay(`${d}d ${String(h).padStart(2,"0")}h ${String(min).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s left`);
        setPct(Math.round((elapsed / total) * 100));
        setPhase("active");
      } else {
        setDisplay("Trip ended"); setPct(100); setPhase("ended");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

  const color = phase === "ended" ? "#6b7280" : phase === "waiting" ? "#3b82f6" : "#00B14F";
  const bgColor = phase === "ended" ? "#f3f4f6" : phase === "waiting" ? "#eff6ff" : "#E8F8EE";

  return (
    <div className="mt-2 rounded-xl px-3 py-2" style={{ background: bgColor }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color }}>
          {phase === "waiting" ? "⏳" : phase === "active" ? "🚐" : "✅"} {display}
        </span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [proofModal, setProofModal] = useState<string | null>(null);

  const load = async () => {
    const data = await fetch("/api/admin/bookings").then(r => r.json());
    const list: Booking[] = Array.isArray(data) ? data : [];

    // Auto-complete confirmed bookings whose end date has passed
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const toComplete = list.filter(
      b => b.status === "confirmed" && new Date(b.endDate) < now
    );
    await Promise.all(
      toComplete.map(b =>
        fetch(`/api/bookings/${b.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        })
      )
    );
    // Reload if any were auto-completed
    if (toComplete.length > 0) {
      const refreshed = await fetch("/api/admin/bookings").then(r => r.json());
      setBookings(Array.isArray(refreshed) ? refreshed : []);
    } else {
      setBookings(list);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const markFeePaid = async (id: number) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationFeePaid: true }),
    });
    load();
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = filterStatus === "all" ? bookings : bookings.filter(b => b.status === filterStatus);

  const counts = {
    all: bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{bookings.length} total reservations</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all"
            style={filterStatus === s
              ? { background: "#00B14F", color: "#fff", boxShadow: "0 4px 12px rgba(0,177,79,0.3)" }
              : { background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb" }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(0,0,0,0.08)" }}>
              {counts[s as keyof typeof counts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(b => {
            const ss = STATUS_STYLE[b.status] ?? STATUS_STYLE.pending;
            const icon = TYPE_ICONS[b.vehicle.type] ?? "🚗";
            const nights = Math.max(1, Math.ceil(
              (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000
            ));

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header row */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
                  style={{ background: "#f8fafc" }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-gray-900 text-sm">{b.vehicle.name}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}
                      <span className="text-gray-400 ml-1">({nights}d)</span>
                    </span>
                    <span className="text-gray-400 text-xs">· #{b.id}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: ss.bg, color: ss.text }}>
                    {ss.label}
                  </span>
                </div>

                {/* Timer bar — confirmed/pending only */}
                {(b.status === "confirmed" || b.status === "pending") && (
                  <div className="px-5 pb-0 pt-3 -mb-2">
                    <BookingTimer startDate={b.startDate} endDate={b.endDate} />
                  </div>
                )}

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                  {/* Customer info */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Customer</div>
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-sm text-gray-500">{b.customerEmail}</div>
                    <div className="text-sm text-gray-500">{b.customerPhone}</div>
                    {b.notes && <div className="text-xs text-gray-400 mt-1.5">📝 {b.notes}</div>}

                    {/* Driver info */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {b.needsDriver ? (
                        b.assignedDriver ? (
                          <div className="text-xs">
                            <span className="font-semibold text-gray-500">🧑‍✈️ Driver: </span>
                            <span className="font-bold text-gray-900">{b.assignedDriver.name}</span>
                            <span className="text-gray-400"> · {b.assignedDriver.phone}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">🧑‍✈️ Driver: <em>Pending assignment</em></div>
                        )
                      ) : (
                        <div className="text-xs text-gray-500">
                          🚗 Self-drive
                          {b.licenseHolderName && <span> · License: <strong>{b.licenseHolderName}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment breakdown */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Payment</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="font-extrabold text-gray-900">₱{b.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Reservation (30%)</span>
                        <span className="font-semibold" style={{ color: b.reservationFeePaid ? "#00803A" : "#dc2626" }}>
                          ₱{(b.reservationFee || Math.round(b.totalPrice * 0.3)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-100 pt-1.5">
                        <span className="text-gray-500">Remaining on pickup</span>
                        <span className="font-bold text-gray-900">
                          ₱{(b.remainingBalance || b.totalPrice - Math.round(b.totalPrice * 0.3)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {b.reservationFeeMethod && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                          Reservation: {METHOD_LABEL[b.reservationFeeMethod] ?? b.reservationFeeMethod}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "#f3f4f6", color: "#374151" }}>
                        Pickup: {METHOD_LABEL[b.paymentMethod] ?? b.paymentMethod}
                      </span>
                    </div>

                    {/* Reservation fee paid status */}
                    <div className="mt-2.5">
                      {b.reservationFeePaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: "#dcfce7", color: "#166534" }}>
                          ✓ Reservation Fee Paid
                        </span>
                      ) : (
                        <button onClick={() => markFeePaid(b.id)}
                          className="px-3 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80"
                          style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                          ⏳ Mark Fee as Paid
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Proof of payment */}
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Proof of Payment</div>
                    {b.proofImageUrl ? (
                      <div>
                        <button onClick={() => setProofModal(b.proofImageUrl!)}
                          className="relative group w-full rounded-xl overflow-hidden border border-gray-200 hover:border-green-400 transition-all"
                          style={{ height: "110px" }}>
                          <img src={b.proofImageUrl} alt="Proof"
                            className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                              🔍 View Full
                            </span>
                          </div>
                        </button>
                        <p className="text-xs text-gray-400 mt-1 text-center">Click to enlarge</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-300"
                        style={{ height: "110px" }}>
                        <span className="text-2xl">📷</span>
                        <span className="text-xs mt-1">No proof uploaded</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {b.status === "pending" && (
                        <button onClick={() => updateStatus(b.id, "confirmed")}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: "#dcfce7", color: "#166534" }}>
                          ✓ Confirm
                        </button>
                      )}
                      {(b.status === "confirmed" || b.status === "pending") && (
                        <button onClick={() => {
                          if (!confirm("Mark this booking as completed? The vehicle will become available for new bookings.")) return;
                          updateStatus(b.id, "completed");
                        }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: "#ede9fe", color: "#5b21b6" }}>
                          ✓ Complete
                        </button>
                      )}
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <button onClick={() => updateStatus(b.id, "cancelled")}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: "#fee2e2", color: "#991b1b" }}>
                          ✕ Cancel
                        </button>
                      )}
                      <button onClick={() => deleteBooking(b.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-400">
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

      {/* Proof modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setProofModal(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={proofModal} alt="Proof of payment" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => setProofModal(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 font-bold text-sm shadow">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}