import Link from "next/link";

const services = [
  { icon: "🚗", label: "GrabCar", sub: "Sedan / City Ride", href: "/vehicles?type=Sedan" },
  { icon: "🚐", label: "GrabVan", sub: "Van up to 10 pax", href: "/vehicles?type=Van" },
  { icon: "🚙", label: "GrabSUV", sub: "SUV up to 7 pax", href: "/vehicles?type=SUV" },
  { icon: "🚌", label: "GrabCoaster", sub: "25 pax bus", href: "/vehicles?type=Coaster" },
  { icon: "🚎", label: "GrabMinibus", sub: "15 pax shuttle", href: "/vehicles?type=Minibus" },
  { icon: "🗺️", label: "Tour Packages", sub: "Day tours & trips", href: "/packages" },
];

const destinations = [
  { name: "Eden Nature Park", dist: "~18 km", icon: "🌿" },
  { name: "Mt. Apo Day Tour", dist: "~45 km", icon: "⛰️" },
  { name: "Samal Island", dist: "~12 km", icon: "🏝️" },
  { name: "Crocodile Park", dist: "~8 km", icon: "🐊" },
  { name: "Jack's Ridge", dist: "~9 km", icon: "🌅" },
  { name: "Durian Lane", dist: "~3 km", icon: "🍈" },
];

const whys = [
  { icon: "⚡", title: "Instant Booking", desc: "Reserve in under 2 minutes. Confirmed same day." },
  { icon: "🛡️", title: "Safe & Insured", desc: "All vehicles LTO-registered with comprehensive insurance." },
  { icon: "👨‍✈️", title: "Pro Drivers", desc: "Licensed, background-checked, Davao-local drivers." },
  { icon: "💬", title: "24/7 Support", desc: "We're always reachable for any concern or changes." },
];

export default function Home() {
  return (
    <div style={{ background: "#F7F8FA" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #004d23 0%, #00803A 50%, #00B14F 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-20 md:pb-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              🌴 Davao City&apos;s #1 Vehicle Rental
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Where do you want<br />to go today?
            </h1>
            <p className="text-base md:text-lg mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
              Book a van, SUV, coaster, or sedan — explore Davao City and beyond.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/vehicles"
                className="px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg"
                style={{ background: "#fff", color: "#00B14F" }}>
                🚐 See All Vehicles
              </Link>
              <Link href="/packages"
                className="px-6 py-3 rounded-full font-bold text-sm transition-all border-2"
                style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff" }}>
                🗺️ Tour Packages
              </Link>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}>
              {[["150+", "Trips Done"], ["5★", "Avg Rating"], ["24/7", "Support"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-extrabold text-white">{n}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Service Types (Grab-style pills) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose your ride</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {services.map((s) => (
              <Link key={s.label} href={s.href} className="cat-pill group">
                <span className="text-3xl">{s.icon}</span>
                <span className="font-bold text-gray-900 text-xs text-center leading-tight">{s.label}</span>
                <span className="text-gray-400 text-xs text-center hidden sm:block">{s.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popular Destinations</h2>
          <Link href="/packages" className="text-sm font-semibold" style={{ color: "#00B14F" }}>
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {destinations.map((d) => (
            <Link key={d.name} href="/packages"
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all block text-center">
              <div className="text-3xl mb-2">{d.icon}</div>
              <div className="font-semibold text-gray-900 text-xs leading-tight">{d.name}</div>
              <div className="text-gray-400 text-xs mt-1">{d.dist}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Davao Tours ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Why Davao Tours?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whys.map((w) => (
            <div key={w.title} className="feature-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 feature-icon"
                style={{ background: "#E8F8EE" }}>
                {w.icon}
              </div>
              <div className="font-bold text-gray-900 text-sm mb-1">{w.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #004d23, #00803A)" }}>
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to explore Davao?</h2>
            <p className="mb-7 text-sm md:text-base" style={{ color: "rgba(255,255,255,0.8)" }}>
              Create an account and book your first ride in minutes.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/register"
                className="px-7 py-3 rounded-full font-bold text-sm transition-all shadow-lg"
                style={{ background: "#fff", color: "#00B14F" }}>
                Get Started Free
              </Link>
              <Link href="/vehicles"
                className="px-7 py-3 rounded-full font-bold text-sm border-2 transition-all"
                style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff" }}>
                Browse Vehicles
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}