"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(data.error || "Registration failed.");
      setLoading(false);
    }
  };

  const inp = "w-full rounded-2xl px-4 py-3.5 text-sm outline-none border-2 border-gray-200 focus:border-green-400 focus:ring-4 focus:ring-green-50 bg-white transition-all";

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F8FA" }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #004d23 0%, #00803A 50%, #00B14F 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)" }} />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black mb-8"
            style={{ background: "rgba(255,255,255,0.2)" }}>DT</div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Join Davao Tours<br />today
          </h1>
          <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.8)" }}>
            Create a free account and start booking<br />vehicles across Davao City.
          </p>
          <div className="flex flex-col gap-3">
            {["✅ Free to join", "📋 Book in minutes", "🛡️ Secure & insured", "💬 24/7 customer support"].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 font-extrabold text-xl" style={{ color: "#00B14F" }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: "#00B14F" }}>DT</span>
            Davao Tours
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Already have one?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#00B14F" }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Juan dela Cruz" required autoFocus className={inp} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com" required className={inp} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="09xx-xxx-xxxx" className={inp} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="min. 6 characters" required className={inp} style={{ paddingRight: "44px" }} />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input type={showPass ? "text" : "password"} value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="repeat password" required className={inp} />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                style={{ background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed btn-green mt-2">
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing up you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}