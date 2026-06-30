"use client";

import { useEffect, useState } from "react";

type TourPackage = {
  id: number;
  name: string;
  destination: string;
  duration: number;
  price: number;
  description: string | null;
  includes: string | null;
  isActive: boolean;
};

const DEST_ICONS: Record<string, string> = {
  "Eden Nature Park": "🌿",
  "Philippine Eagle Center": "🦅",
  "Samal Island": "🏝️",
  "Mt. Apo": "⛰️",
  "Jack's Ridge": "🌅",
  "Crocodile Park": "🐊",
  "People's Park": "🌳",
  "Malagos Garden Resort": "🌸",
  "Pearl Farm Beach": "🏖️",
  "Davao Airport Transfer": "✈️",
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages").then(r => r.json()).then(data => {
      setPackages(data.filter((p: TourPackage) => p.isActive));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ background: "#F7F8FA" }}>
      {/* Header */}
      <div className="py-10 px-4"
        style={{ background: "linear-gradient(160deg, #004d23 0%, #00B14F 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(255,255,255,0.6)" }}>Explore Davao</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">Tour Packages</h1>
          <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm">
            Curated day tours and trips with professional drivers included
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse h-64" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="font-medium">No packages available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map(p => {
              const includes: string[] = p.includes ? JSON.parse(p.includes) : [];
              const icon = DEST_ICONS[p.destination] ?? "🗺️";
              return (
                <div key={p.id} className="vehicle-card">
                  {/* Header */}
                  <div className="p-6 relative"
                    style={{ background: "linear-gradient(135deg, #E8F8EE, #f0fdf4)" }}>
                    <div className="text-5xl mb-3">{icon}</div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{p.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {p.destination}</p>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>⏱ {p.duration}h tour</span>
                      <span className="font-extrabold text-lg" style={{ color: "#00B14F" }}>
                        ₱{p.price.toLocaleString()}
                      </span>
                    </div>

                    {includes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {includes.map(inc => (
                          <span key={inc} className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "#E8F8EE", color: "#00803A" }}>✓ {inc}</span>
                        ))}
                      </div>
                    )}

                    {p.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{p.description}</p>
                    )}

                    <div className="mt-auto">
                      <a href="/booking"
                        className="block w-full py-2.5 rounded-xl text-sm font-bold text-center text-white btn-green">
                        Book This Package →
                      </a>
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