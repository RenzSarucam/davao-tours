"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  isBefore,
  startOfDay,
} from "date-fns";

type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
};

type Vehicle = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  description: string | null;
  plateNumber: string;
  isAvailable: boolean;
  bookings: Booking[];
};

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then((r) => r.json())
      .then(setVehicle);
  }, [id]);

  if (!vehicle) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  const startDayOfWeek = start.getDay();

  const bookedIntervals = vehicle.bookings
    .filter((b) => b.status !== "cancelled")
    .map((b) => ({
      start: new Date(b.startDate),
      end: new Date(b.endDate),
    }));

  const isBooked = (day: Date) =>
    bookedIntervals.some((interval) =>
      isWithinInterval(day, { start: interval.start, end: interval.end })
    );

  const isPast = (day: Date) => isBefore(day, startOfDay(new Date()));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link href="/vehicles" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Vehicles
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-8xl">
          {vehicle.type === "Van" ? "🚐" : vehicle.type === "Coaster" ? "🚌" : vehicle.type === "SUV" ? "🚙" : "🚗"}
        </div>
        <div>
          <div className="flex items-start gap-3 mb-3">
            <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                vehicle.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {vehicle.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600 mb-4">
            <span>🏷️ {vehicle.type}</span>
            <span>👥 {vehicle.capacity} passengers</span>
            <span>🔖 {vehicle.plateNumber}</span>
          </div>
          {vehicle.description && (
            <p className="text-gray-600 mb-6">{vehicle.description}</p>
          )}
          <div className="mb-6">
            <span className="text-3xl font-bold text-blue-600">₱{vehicle.pricePerDay.toLocaleString()}</span>
            <span className="text-gray-500 ml-1">/ day</span>
          </div>
          {vehicle.isAvailable && (
            <Link
              href={`/booking?vehicleId=${vehicle.id}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold inline-block"
            >
              Book This Vehicle
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Availability Calendar</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ‹
            </button>
            <span className="font-medium text-gray-700 min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const booked = isBooked(day);
            const past = isPast(day);
            const today = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg m-0.5 font-medium
                  ${booked ? "bg-red-100 text-red-600" : past ? "text-gray-300" : "bg-green-50 text-green-700"}
                  ${today ? "ring-2 ring-blue-500" : ""}
                `}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        <div className="flex gap-6 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 rounded inline-block" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 rounded inline-block" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-blue-500 rounded inline-block" /> Today
          </span>
        </div>
      </div>
    </div>
  );
}
