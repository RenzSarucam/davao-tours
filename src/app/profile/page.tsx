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

    // Fetch full profile for phone
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F8FA" }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: "#00B14F", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "#F7F8FA" }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #00B14F, #00803A)" }}>
            {me?.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 text-sm mt-1">{me?.email}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>

            {/* Personal Info Section */}
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white"
                  style={{ background: "#00B14F" }}>👤</span>
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: "#e5e7eb" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={me?.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    style={{ borderColor: "#e5e7eb" }}
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: "#e5e7eb" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white"
                  style={{ background: "#00B14F" }}>🔒</span>
                Change Password
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: "#e5e7eb" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: "#e5e7eb" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                    style={{ borderColor: "#e5e7eb" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#00B14F")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            </div>

            {/* Messages + Submit */}
            <div className="px-6 pb-6 space-y-3">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                  ❌ {error}
                </div>
              )}
              {success && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: "#E8F8EE", color: "#00803A", border: "1px solid #bbf7d0" }}>
                  ✅ {success}
                </div>
              )}

              <button type="submit" disabled={saving}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all"
                style={{ background: saving ? "#86efac" : "#00B14F" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button type="button" onClick={() => router.back()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}