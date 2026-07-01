"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  customerName: string;
  vehicleId: number;
};

type Vehicle = {
  id: number;
  name: string;
  type: string;
};

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  confirmed: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  completed: { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const TYPE_ICONS: Record<string, string> = {
  Van: "🚐", Coaster: "🚌", SUV: "🚙", Sedan: "🚗", Minibus: "🚎", Pickup: "🛻",
};

export default function AdminCalendarPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles").then(r => r.json()),
      fetch("/api/admin/bookings").then(r => r.json()),
    ]).then(([v, b]) => {
      setVehicles(Array.isArray(v) ? v : []);
      setBookings(Array.isArray(b) ? b : []);
      setLoading(false);
    });
  }, []);

  const { year, month: m } = month;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const monthName = new Date(year, m).toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = today.getFullYear() === year && today.getMonth() === m ? today.getDate() : null;

  const prevMonth = () => setMonth(({ year, month }) => {
    const d = new Date(year, month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setMonth(({ year, month }) => {
    const d = new Date(year, month + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Get bookings for a vehicle on a specific day
  const getBookingForDay = (vehicleId: number, day: number) => {
    const date = new Date(year, m, day);
    date.setHours(12, 0, 0, 0);
    return bookings.find(b => {
      if (b.vehicleId !== vehicleId) return false;
      if (b.status === "cancelled") return false;
      const start = new Date(b.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(b.endDate); end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  const isStartDay = (booking: Booking, day: number) => {
    const s = new Date(booking.startDate);
    return s.getFullYear() === year && s.getMonth() === m && s.getDate() === day;
  };

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vehicle availability overview</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_COLOR).filter(([k]) => k !== "cancelled").map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: v.bg, color: v.text, border: `1px solid ${v.border}` }}>
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: "#f3f4f6", color: "#6b7280" }}>
            ○ Free
          </span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}
          className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all">
          ‹ Prev
        </button>
        <h2 className="text-lg font-extrabold text-gray-900">{monthName}</h2>
        <button onClick={nextMonth}
          className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all">
          Next ›
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: `${200 + daysInMonth * 36}px` }}>
              <thead>
                <tr style={{ background: "#004d23" }}>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/80 w-48 sticky left-0 z-10"
                    style={{ background: "#004d23" }}>
                    Vehicle
                  </th>
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === todayDay;
                    const dow = new Date(year, m, day).toLocaleDateString("en-PH", { weekday: "short" });
                    return (
                      <th key={day}
                        className="text-center py-2 text-xs font-bold w-9"
                        style={{
                          color: isToday ? "#4ade80" : "rgba(255,255,255,0.7)",
                          background: isToday ? "rgba(0,177,79,0.3)" : undefined,
                          minWidth: "36px",
                        }}>
                        <div>{day}</div>
                        <div className="text-xs opacity-60" style={{ fontSize: "9px" }}>{dow}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    {/* Vehicle name — sticky left */}
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_ICONS[v.type] ?? "🚗"}</span>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs">{v.name}</div>
                          <div className="text-xs text-gray-400">{v.type}</div>
                        </div>
                      </div>
                    </td>
                    {/* Days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const booking = getBookingForDay(v.id, day);
                      const isToday = day === todayDay;
                      const sc = booking ? STATUS_COLOR[booking.status] : null;
                      const showLabel = booking && isStartDay(booking, day);

                      return (
                        <td key={day}
                          className="text-center p-0.5 relative"
                          style={{ background: isToday ? "#f0fdf4" : undefined }}>
                          {booking && sc ? (
                            <div
                              title={`${booking.customerName} — ${booking.status}`}
                              className="w-full h-8 rounded flex items-center justify-center overflow-hidden"
                              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                              {showLabel && (
                                <span className="text-xs font-bold truncate px-1 hidden md:block"
                                  style={{ color: sc.text, fontSize: "9px" }}>
                                  {booking.customerName.split(" ")[0]}
                                </span>
                              )}
                              {!showLabel && (
                                <span className="w-full h-full block" style={{ background: sc.bg }} />
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-8 rounded flex items-center justify-center"
                              style={{ background: isToday ? "#dcfce7" : "#f8fafc" }}>
                              <span className="text-gray-200 text-xs">·</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary row */}
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500"
            style={{ background: "#f8fafc" }}>
            {vehicles.map(v => {
              const activeBookings = bookings.filter(b => b.vehicleId === v.id && (b.status === "pending" || b.status === "confirmed"));
              return activeBookings.length > 0 ? (
                <span key={v.id} className="font-semibold" style={{ color: "#00803A" }}>
                  {TYPE_ICONS[v.type]} {v.name}: {activeBookings.length} active booking{activeBookings.length > 1 ? "s" : ""}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}