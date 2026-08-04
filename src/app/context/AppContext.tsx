"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loadingUser: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize theme and check session
  useEffect(() => {
    const savedTheme = localStorage.getItem("cinema_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }

    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setLoadingUser(true);
      // Fetch current session from server-side decoded cookies
      const res = await fetch("/api/movies/suggestions?q=inception"); // just dummy check or separate user endpoint
      // Let's create a small endpoint or just check suggestions and fetch user directly
      const userRes = await fetch("/api/user/profile-check"); // Let's make sure we have an endpoint or fetch from profile-check
      if (userRes.ok) {
        const data = await userRes.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("cinema_theme", nextTheme);
  };

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        addToast("Logged out successfully", "success");
      }
    } catch (error) {
      addToast("Failed to logout", "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        logout,
        refreshUser,
      }}
    >
      <div className={theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}>
        <div className="min-h-screen transition-colors duration-300">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
