"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: number; name: string; email: string; role: string } | null;

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data || data.role === "admin") { router.push("/login"); return; }
        setMe(data);
        setName(data.name || "");
        setLoading(false);
      });
    fetch("/api/auth/me/profile")
      .then(r => r.json())
      .then(data => { if (data?.phone) setPhone(data.phone); });
  }, [router]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match"); return;
    }
    setSaving(true);
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setSuccess("Profile updated successfully!");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setMe(prev => prev ? { ...prev, name: data.name } : prev);
  };

  const inp = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-all";

  if (loading) return (
    <div className="flex items-center justify-center py-24" style={{ background: "#F7F8FA" }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div style={{ background: "#F7F8FA" }}>

      {/* Header banner */}
      <div className="py-5 px-6" style={{ background: "linear-gradient(135deg, #004d23 0%, #00B14F 100%)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)" }}>
            {me?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-white leading-tight">Edit Profile</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{me?.email}</p>
          </div>
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Left — Personal Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                    style={{ background: "#00B14F" }}>👤</span>
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      className={inp} style={{ borderColor: "#e5e7eb" }} placeholder="Your full name"
                      onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={me?.email || ""} disabled
                      className="w-full px-3 py-2.5 rounded-xl border text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      style={{ borderColor: "#e5e7eb" }} />
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      className={inp} style={{ borderColor: "#e5e7eb" }} placeholder="09XXXXXXXXX"
                      onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>
              </div>

              {/* Right — Change Password */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                    style={{ background: "#00B14F" }}>🔒</span>
                  Change Password
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className={inp} style={{ borderColor: "#e5e7eb" }} placeholder="Enter current password"
                      onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className={inp} style={{ borderColor: "#e5e7eb" }} placeholder="Min. 6 characters"
                      onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className={inp} style={{ borderColor: "#e5e7eb" }} placeholder="Re-enter new password"
                      onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback + Submit */}
            <div className="mt-4 space-y-2">
              {error && (
                <div className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                  ❌ {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "#E8F8EE", color: "#00803A", border: "1px solid #bbf7d0" }}>
                  ✅ {success}
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all"
                style={{ background: saving ? "#86efac" : "#00B14F" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}