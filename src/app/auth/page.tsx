"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import { Film, Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";

export default function AuthPage() {
  const { user, setUser, addToast, theme } = useApp();
  const router = useRouter();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState(""); // username or email
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      addToast("Please fill in all fields", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      addToast(`Welcome back, ${data.user.username}!`, "success");
      // Force hard reload so that Server Components read updated cookies!
      window.location.href = "/";
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      addToast("Please fill in all fields", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data.user);
      addToast(`Account created successfully! Welcome ${data.user.username}.`, "success");
      window.location.href = "/";
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/10 dark:bg-slate-950/20">
      <div className={`max-w-md w-full space-y-8 p-8 rounded-3xl shadow-2xl border ${
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
            <Film className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {activeTab === "login" ? "Welcome Back!" : "Join CinemaHub"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "login"
              ? "Discover trailers, ratings, and reviews from real fans."
              : "Create an account to start saving watchlists and reviews."}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all ${
              activeTab === "login"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        {activeTab === "login" ? (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Enter email or username"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      theme === "dark"
                        ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      theme === "dark"
                        ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Cinephile_99"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      theme === "dark"
                        ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      theme === "dark"
                        ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                      theme === "dark"
                        ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Must be at least 6 characters long.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-black text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
