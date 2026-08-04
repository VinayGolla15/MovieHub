"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  Film,
  Search,
  Bookmark,
  Heart,
  User,
  Shield,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Star,
} from "lucide-react";

interface Suggestion {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating: number;
  genre: string;
}

export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/movies/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (movieId: number) => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/movies/${movieId}`);
  };

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
      theme === "dark" 
        ? "bg-slate-950/80 border-slate-800 text-slate-100" 
        : "bg-white/80 border-slate-200 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-wider text-purple-600 dark:text-purple-400">
              <Film className="h-6 w-6 stroke-[2.5]" />
              <span>CINEMAHUB</span>
            </Link>
          </div>

          {/* Autocomplete Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search movies by title, actors, director..."
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-full outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 text-slate-100 border border-slate-800 placeholder-slate-400" 
                    : "bg-slate-100 text-slate-900 border border-slate-200 placeholder-slate-500"
                }`}
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute left-0 right-0 top-12 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <div className="p-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-inherit">
                  Suggestions
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item.id)}
                      className={`w-full text-left flex items-center gap-3 p-2.5 hover:bg-purple-600 hover:text-white transition-colors border-b last:border-b-0 border-inherit`}
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{item.title}</div>
                        <div className="text-xs text-slate-400 hover:text-purple-200 flex items-center gap-1.5 mt-0.5">
                          <span>{item.releaseYear}</span>
                          <span>•</span>
                          <span className="truncate">{item.genre}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{item.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Links & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="text-sm font-semibold hover:text-purple-500 transition-colors"
            >
              Browse Movies
            </Link>

            {user ? (
              <>
                <Link
                  href="/watchlist"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:text-purple-500 transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Watchlist</span>
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:text-purple-500 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20 font-bold hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            ) : null}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                theme === "dark" 
                  ? "border-slate-800 hover:bg-slate-900 text-yellow-400" 
                  : "border-slate-200 hover:bg-slate-100 text-purple-600"
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover border border-purple-500"
                  />
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border overflow-hidden py-1 z-50 ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                  }`}>
                    <div className="px-4 py-2 border-b border-inherit">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-bold text-sm truncate text-purple-400">{user.username}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-purple-600 hover:text-white transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-5 py-2 rounded-full transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${
                theme === "dark" ? "border-slate-800 text-yellow-400" : "border-slate-200 text-purple-600"
              }`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-full border ${
                theme === "dark" ? "border-slate-800" : "border-slate-200"
              }`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-4 shadow-xl ${
          theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-full outline-none focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-900 border border-slate-800" : "bg-slate-100 border border-slate-200"
              }`}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          <div className="flex flex-col gap-2">
            <Link
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-semibold"
            >
              Browse Movies
            </Link>
            {user ? (
              <>
                <Link
                  href="/watchlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-semibold"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Watchlist</span>
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-semibold"
                >
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors font-semibold"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg text-rose-500 hover:bg-rose-600 hover:text-white transition-colors font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center bg-purple-600 text-white font-bold py-2.5 rounded-full transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
