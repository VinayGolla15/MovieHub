"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { Star, Heart, Bookmark, Play } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating: number;
  genre: string;
  status: string;
}

interface MovieCardProps {
  movie: Movie;
  initialFavorite?: boolean;
  initialWatchlist?: boolean;
  onStateChange?: () => void;
}

export default function MovieCard({
  movie,
  initialFavorite = false,
  initialWatchlist = false,
  onStateChange,
}: MovieCardProps) {
  const { user, addToast, theme } = useApp();
  const [isFav, setIsFav] = useState(initialFavorite);
  const [isWatch, setIsWatch] = useState(initialWatchlist);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isTogglingWatch, setIsTogglingWatch] = useState(false);

  // Sync initial props
  useEffect(() => {
    setIsFav(initialFavorite);
  }, [initialFavorite]);

  useEffect(() => {
    setIsWatch(initialWatchlist);
  }, [initialWatchlist]);

  // Fetch initial state if logged in and not supplied
  useEffect(() => {
    if (user && onStateChange === undefined) {
      // We can also fetch the state from profile or let page handle it,
      // but to be extremely safe, we can fetch favorites/watchlist on load
      // or let parent pass it down.
    }
  }, [user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast("Please sign in to save favorites!", "info");
      return;
    }

    if (isTogglingFav) return;

    try {
      setIsTogglingFav(true);
      // Optimistic Update
      const nextState = !isFav;
      setIsFav(nextState);

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setIsFav(data.added);
      addToast(data.message, "success");

      if (onStateChange) onStateChange();
    } catch (error) {
      // Revert on error
      setIsFav(!isFav);
      addToast("Failed to update favorites. Try again.", "error");
    } finally {
      setIsTogglingFav(false);
    }
  };

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast("Please sign in to update your watchlist!", "info");
      return;
    }

    if (isTogglingWatch) return;

    try {
      setIsTogglingWatch(true);
      const nextState = !isWatch;
      setIsWatch(nextState);

      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setIsWatch(data.added);
      addToast(data.message, "success");

      if (onStateChange) onStateChange();
    } catch (error) {
      setIsWatch(!isWatch);
      addToast("Failed to update watchlist. Try again.", "error");
    } finally {
      setIsTogglingWatch(false);
    }
  };

  return (
    <div className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
      theme === "dark" 
        ? "bg-slate-900/60 border border-slate-800" 
        : "bg-white border border-slate-200"
    }`}>
      {/* Poster Image with Overlay */}
      <Link href={`/movies/${movie.id}`} className="block relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-purple-600 text-white p-4 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md text-amber-500 font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-800">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md">
          {movie.status}
        </div>
      </Link>

      {/* Description Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
          <span>{movie.releaseYear}</span>
          <span>•</span>
          <span className="truncate">{movie.genre.split(",")[0]}</span>
        </div>

        <Link href={`/movies/${movie.id}`}>
          <h3 className="font-bold text-base truncate group-hover:text-purple-500 transition-colors" title={movie.title}>
            {movie.title}
          </h3>
        </Link>

        {/* Quick Toggles */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Quick Save</span>
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg transition-colors ${
                isFav
                  ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500"
              }`}
              title="Add to Favorites"
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleToggleWatchlist}
              className={`p-1.5 rounded-lg transition-colors ${
                isWatch
                  ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-purple-500"
              }`}
              title="Add to Watchlist"
            >
              <Bookmark className={`h-4 w-4 ${isWatch ? "fill-purple-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
