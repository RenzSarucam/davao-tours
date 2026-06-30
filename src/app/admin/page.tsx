"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    vehicles: 0, availableVehicles: 0,
    bookings: 0, pending: 0, confirmed: 0,
    drivers: 0, availableDrivers: 0,
    packages: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/drivers").then((r) => r.json()),
      fetch("/api/packages").then((r) => r.json()),
    ]).then(([vehicles, bookings, drivers, packages]) => {
      setStats({
        vehicles: vehicles.length,
        availableVehicles: vehicles.filter((v: { isAvailable: boolean }) => v.isAvailable).length,
        bookings: bookings.length,
        pending: bookings.filter((b: { status: string }) => b.status === "pending").length,
        confirmed: bookings.filter((b: { status: string }) => b.status === "confirmed").length,
        drivers: drivers.length,
        availableDrivers: drivers.filter((d: { status: string }) => d.status === "available").length,
        packages: packages.length,
      });
    });
  }, []);

  const statCards = [
    { label: "Total Vehicles",   value: stats.vehicles,         sub: `${stats.availableVehicles} available`,   icon: "🚐", color: "#dbeafe", link: "/admin/vehicles" },
    { label: "Total Bookings",   value: stats.bookings,         sub: `${stats.confirmed} confirmed`,           icon: "📋", color: "#dcfce7", link: "/admin/bookings" },
    { label: "Pending Approval", value: stats.pending,          sub: "needs action",                          icon: "⏳", color: "#fef3c7", link: "/admin/bookings" },
    { label: "Drivers",          value: stats.drivers,          sub: `${stats.availableDrivers} available`,   icon: "👨‍✈️", color: "#f3e8ff", link: "/admin/drivers" },
  ];

  const menuItems = [
    { href: "/admin/vehicles", icon: "🚐", title: "Fleet Management",   desc: "Add, edit, delete vehicles. Manage amenities, color, year, and pricing." },
    { href: "/admin/bookings", icon: "📋", title: "Bookings",           desc: "View, confirm, or cancel customer reservations." },
    { href: "/admin/drivers",  icon: "👨‍✈️", title: "Driver Management", desc: "Register drivers, track availability and assign trips." },
    { href: "/admin/packages", icon: "🗺️", title: "Tour Packages",      desc: "Create tour packages with destinations, duration, and inclusions." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's your Davao Tours overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.link}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all block">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: s.color }}>
                {s.icon}
              </div>
              <span className="text-3xl font-extrabold" style={{ color: "#0f4c81" }}>{s.value}</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Access Menu */}
      <h2 className="text-base font-bold text-gray-700 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all block"
            style={{ borderTop: "3px solid #0f4c81" }}>
            <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 inline-block">
              {item.icon}
            </div>
            <div className="font-bold text-gray-900 mb-1">{item.title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
            <div className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: "#0f4c81" }}>
              Open <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}