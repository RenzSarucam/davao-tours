"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  needsDriver: boolean;
  paymentMethod: string;
  notes: string | null;
  licenseHolderName: string | null;
  vehicle: { name: string; type: string; plateNumber: string };
  assignedDriver: { name: string; phone: string } | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  confirmed: { bg: "#E8F8EE", color: "#00803A", label: "Confirmed" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", label: "Cancelled" },
  completed: { bg: "#f0f4ff", color: "#3730a3", label: "Completed" },
};

const PAYMENT_ICON: Record<string, string> = {
  cash: "💵", gcash: "📱", bank: "🏦",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(me => {
      if (!me || me.role === "admin") { router.push("/login"); return; }
      setAuthed(true);
      fetch("/api/my-bookings").then(r => r.json()).then(data => {
        setBookings(data);
        setLoading(false);
      });
    });
  }, [router]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

  if (!authed || loading) return (
    <div className="flex items-center justify-center py-32" style={{ background: "#F7F8FA" }}>
      <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div style={{ background: "#F7F8FA" }}>
      {/* Header */}
      <div className="py-8 px-6" style={{ background: "linear-gradient(135deg, #004d23 0%, #00B14F 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white">My Bookings</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
            All your vehicle reservations
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🚐</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-sm text-gray-400 mb-6">Book a vehicle to get started on your Davao adventure.</p>
            <Link href="/vehicles"
              className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: "#00B14F" }}>
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => {
              const s = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
              const days = Math.max(1, Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000));
              return (
                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-400">Booking #{b.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vehicle */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Vehicle</div>
                      <div className="font-bold text-gray-900">{b.vehicle.name}</div>
                      <div className="text-xs text-gray-400">{b.vehicle.type} · {b.vehicle.plateNumber}</div>
                    </div>

                    {/* Dates */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Trip Dates</div>
                      <div className="font-semibold text-gray-900 text-sm">{formatDate(b.startDate)}</div>
                      <div className="text-xs text-gray-400">to {formatDate(b.endDate)} · {days} day{days > 1 ? "s" : ""}</div>
                    </div>

                    {/* Price & Payment */}
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Total & Payment</div>
                      <div className="font-extrabold text-lg" style={{ color: "#00B14F" }}>
                        ₱{b.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {PAYMENT_ICON[b.paymentMethod] || "💵"} {b.paymentMethod === "gcash" ? "GCash" : b.paymentMethod === "bank" ? "Bank Transfer" : "Cash"}
                      </div>
                    </div>
                  </div>

                  {/* Driver info */}
                  {(b.needsDriver || b.licenseHolderName) && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3"
                      style={{ background: "#F7F8FA" }}>
                      {b.needsDriver ? (
                        <>
                          <span className="text-lg">🧑‍✈️</span>
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Assigned Driver: </span>
                            {b.assignedDriver ? (
                              <span className="text-xs font-bold" style={{ color: "#00803A" }}>
                                {b.assignedDriver.name} · {b.assignedDriver.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Pending assignment</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🚗</span>
                          <span className="text-xs text-gray-600">
                            Self-drive · License: <span className="font-semibold">{b.licenseHolderName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {b.notes && (
                    <div className="px-5 py-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Notes: </span>
                      <span className="text-xs text-gray-600">{b.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}