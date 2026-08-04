"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import MovieCard from "../components/MovieCard";
import { Heart, Film, Sparkles } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating: number;
  genre: string;
  status: string;
}

export default function FavoritesPage() {
  const { user, theme, addToast } = useApp();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setMovies(data.favorites || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to load favorite items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-3xl mb-4">
          <Heart className="h-10 w-10 fill-rose-500" />
        </div>
        <h2 className="text-2xl font-black mb-2">Access Your Favorites</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Create an account or sign in to save your favorite movies in your profile. Express your passion for cinema!
        </p>
        <Link
          href="/auth"
          className="bg-rose-500 hover:bg-rose-600 text-white font-black text-sm px-8 py-3 rounded-full shadow-lg transition-all"
        >
          Sign In or Register
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-500">
          <Heart className="h-6 w-6 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Favorites</h1>
          <p className="text-xs text-slate-400 mt-0.5">Your personal list of ultimate cinematic masterpieces</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 space-y-4 animate-pulse ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="bg-slate-800 h-60 rounded-xl w-full" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              initialFavorite={true}
              onStateChange={fetchFavorites}
            />
          ))}
        </div>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-dashed ${
          theme === "dark" ? "bg-slate-900/20 border-slate-800" : "bg-slate-100/50 border-slate-200"
        }`}>
          <Film className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Favorite Movies Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
            Browse our list and tap the heart icon on any movie card to include it in your ultimate favorites deck.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-lg transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Discover Masterpieces</span>
          </Link>
        </div>
      )}
    </div>
  );
}
