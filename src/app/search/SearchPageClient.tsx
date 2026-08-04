"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import MovieCard from "../components/MovieCard";
import { Search, RotateCcw, SlidersHorizontal, Star, AlertCircle } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  director: string;
  cast: string;
  genre: string;
  language: string;
  releaseYear: number;
  trailerUrl: string;
  duration: string;
  status: string;
}

const GENRES = ["Action", "Sci-Fi", "Drama", "Comedy", "Thriller", "Adventure", "Horror", "Romance", "Fantasy", "Animation"];
const LANGUAGES = ["English", "Spanish", "French", "Japanese", "Korean", "German"];
const STATUSES = ["Trending", "Popular", "Top Rated", "Upcoming"];

function SearchPageContent() {
  const { theme, addToast } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load state from URL parameters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [language, setLanguage] = useState(searchParams.get("language") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state if URL changes externally (e.g. from navbar search)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setGenre(searchParams.get("genre") || "");
    setLanguage(searchParams.get("language") || "");
    setYear(searchParams.get("year") || "");
    setRating(searchParams.get("rating") || "");
    setStatus(searchParams.get("status") || "");
    setPage(1); // Reset page on filter change
  }, [searchParams]);

  // Fetch filtered movies from server REST API
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (genre) params.append("genre", genre);
      if (language) params.append("language", language);
      if (year) params.append("year", year);
      if (rating) params.append("rating", rating);
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch movies");

      const data = await res.json();
      setMovies(data.movies || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err: any) {
      console.error(err);
      addToast("Failed to fetch movie catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [query, genre, language, year, rating, status, page]);

  // Update URL parameters to match state
  const updateUrl = (updatedFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updatedFilters).forEach(([key, val]) => {
      if (val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setQuery("");
    setGenre("");
    setLanguage("");
    setYear("");
    setRating("");
    setStatus("");
    setPage(1);
    router.push("/search");
    addToast("Filters reset", "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
      
      {/* Advanced Filters Sidebar */}
      <div className={`w-full md:w-64 flex-shrink-0 p-6 rounded-2xl border h-fit sticky top-24 ${
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-inherit mb-5">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
            <SlidersHorizontal className="h-4 w-4 text-purple-500" />
            <span>Advanced Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Status filter */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Category</label>
            <select
              value={status}
              onChange={(e) => updateUrl({ status: e.target.value })}
              className={`w-full p-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
              }`}
            >
              <option value="">All Categories</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Genre filter */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => updateUrl({ genre: e.target.value })}
              className={`w-full p-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
              }`}
            >
              <option value="">All Genres</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => updateUrl({ language: e.target.value })}
              className={`w-full p-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
              }`}
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Release Year filter */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Release Year</label>
            <input
              type="number"
              placeholder="e.g. 2024"
              value={year}
              onChange={(e) => updateUrl({ year: e.target.value })}
              className={`w-full p-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-purple-500 ${
                theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
              }`}
            />
          </div>

          {/* Rating filter */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Minimum Rating</span>
              {rating && <span className="text-amber-500 font-bold">{rating}+</span>}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={rating || "1"}
              onChange={(e) => updateUrl({ rating: e.target.value })}
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Movies Grid / Catalog */}
      <div className="flex-1 flex flex-col">
        {/* Dynamic header / Title Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by title inside current filters..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                updateUrl({ q: e.target.value });
              }}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                theme === "dark" 
                  ? "bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500" 
                  : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Found <span className="text-purple-600 dark:text-purple-400">{totalCount}</span> movies matching criteria
          </div>
        </div>

        {/* Loading skeleton state */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden p-4 space-y-4 animate-pulse ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}>
                <div className="bg-slate-800 h-64 rounded-xl w-full" />
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className={`flex-1 flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed ${
            theme === "dark" ? "bg-slate-900/20 border-slate-800" : "bg-slate-100/50 border-slate-200"
          }`}>
            <AlertCircle className="h-12 w-12 text-purple-500/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Movies Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              We couldn't find any movie matching your combination of filters. Try clearing some options or resetting entirely.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-lg transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pb-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 text-sm font-bold bg-slate-800 hover:bg-purple-600 text-white rounded-xl disabled:opacity-45 transition-colors"
            >
              Previous
            </button>
            <div className="text-sm font-black text-slate-500 px-4">
              Page {page} of {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 text-sm font-bold bg-slate-800 hover:bg-purple-600 text-white rounded-xl disabled:opacity-45 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPageClient() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
