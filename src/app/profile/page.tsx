"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { User, Mail, ShieldAlert, Sparkles, Key, Check } from "lucide-react";

const AVATAR_SEEDS = ["Aiden", "Oliver", "Sophia", "Maya", "Leo", "Amara", "Jack", "Luna"];

export default function ProfilePage() {
  const { user, setUser, addToast, theme } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const handlePredefinedAvatarSelect = (seed: string) => {
    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setAvatarUrl(url);
    addToast(`Avatar changed to template "${seed}"`, "info");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      addToast("Username and email are required", "error");
      return;
    }

    if (password && password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          avatarUrl,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setUser(data.user);
      setPassword("");
      setConfirmPassword("");
      addToast("Profile updated successfully!", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Account Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your public bio, credentials, and avatar style</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar Settings */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h2 className="text-lg font-black mb-4 tracking-tight">Your Avatar</h2>
          <div className="relative mb-6">
            <img
              src={avatarUrl || user.avatarUrl}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 bg-slate-950 p-1"
            />
            <div className="absolute bottom-1 right-1 bg-purple-600 text-white p-1.5 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          {/* Quick templates selection */}
          <div className="w-full">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 text-center mb-3">Predefined Templates</p>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                const isSelected = avatarUrl === url;
                return (
                  <button
                    key={seed}
                    onClick={() => handlePredefinedAvatarSelect(seed)}
                    className={`relative rounded-xl overflow-hidden p-1 border hover:scale-105 transition-all ${
                      isSelected ? "border-purple-500 bg-purple-500/10" : "border-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full h-10 object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white font-black stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Avatar URL Field */}
          <div className="w-full mt-6">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Custom Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full p-2.5 rounded-xl outline-none text-xs transition-all focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-50 border border-slate-200"
              }`}
            />
          </div>
        </div>

        {/* Right Column: General Credentials Form */}
        <div className={`md:col-span-2 p-8 rounded-3xl border ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-50 border border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-50 border border-slate-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Key className="h-4 w-4" />
                <span>Change Password (Optional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-50 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-3 rounded-xl outline-none text-sm focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-50 border border-slate-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <ShieldAlert className="h-4 w-4" />
                <span>Updating names might request re-log.</span>
              </div>
              <button
                type="submit"
                disabled={updating}
                className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-sm px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
