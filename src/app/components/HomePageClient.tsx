"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import MovieCard from "./MovieCard";
import { Star, Play, Bookmark, Heart, Sparkles, Trophy, Flame, Calendar } from "lucide-react";

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

interface HomePageClientProps {
  movies: Movie[];
  userFavorites: number[];
  userWatchlist: number[];
}

export default function HomePageClient({
  movies,
  userFavorites = [],
  userWatchlist = [],
}: HomePageClientProps) {
  const { user, addToast, theme: appTheme } = useApp();

  // Pick Dune Part Two or first Trending movie for Hero
  const heroMovie = movies.find(m => m.title === "Dune: Part Two") || movies[0] || null;

  // Split movies by status
  const trending = movies.filter((m) => m.status === "Trending");
  const popular = movies.filter((m) => m.status === "Popular");
  const topRated = movies.filter((m) => m.status === "Top Rated");
  const upcoming = movies.filter((m) => m.status === "Upcoming");

  // Keep track of favorites & watchlist locally so toggles instantly sync across the page
  const [favIds, setFavIds] = useState<number[]>(userFavorites);
  const [watchIds, setWatchIds] = useState<number[]>(userWatchlist);

  const handleStateChange = async () => {
    // Refresh the favIds and watchIds from database APIs
    try {
      const favRes = await fetch("/api/favorites");
      if (favRes.ok) {
        const data = await favRes.json();
        setFavIds(data.favorites.map((m: any) => m.id));
      }

      const watchRes = await fetch("/api/watchlist");
      if (watchRes.ok) {
        const data = await watchRes.json();
        setWatchIds(data.watchlist.map((m: any) => m.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative min-h-[500px] md:min-h-[600px] w-full flex items-center justify-start overflow-hidden">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroMovie.backdropUrl}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-top scale-105 filter brightness-50 dark:brightness-[0.35]"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent dark:from-slate-950 dark:via-slate-950/40 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/60 dark:to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-600/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <Flame className="h-3.5 w-3.5 fill-white animate-pulse" />
                <span>Featured Today</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
                {heroMovie.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-300 mb-6">
                <div className="flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>{heroMovie.rating.toFixed(1)} Rating</span>
                </div>
                <span>•</span>
                <span>{heroMovie.releaseYear}</span>
                <span>•</span>
                <span>{heroMovie.duration}</span>
                <span>•</span>
                <span className="bg-slate-200/80 dark:bg-slate-800/80 px-2 py-1 rounded-md">{heroMovie.language}</span>
              </div>

              {/* Synopsis */}
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-8 line-clamp-3 md:line-clamp-4">
                {heroMovie.synopsis}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/movies/${heroMovie.id}`}
                  className="inline-flex items-center gap-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black px-6 py-3 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all text-sm md:text-base"
                >
                  <Play className="h-5 w-5 fill-white" />
                  <span>View Details & Reviews</span>
                </Link>

                {heroMovie.trailerUrl && (
                  <a
                    href={heroMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/20 dark:bg-slate-900/40 hover:bg-white/30 dark:hover:bg-slate-800/60 border border-slate-300 dark:border-slate-800 backdrop-blur-md text-slate-900 dark:text-white font-bold px-6 py-3 rounded-full transition-all text-sm md:text-base"
                  >
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* Trending Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/10 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                <Flame className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Trending Now</h2>
            </div>
            <Link href="/search?status=Trending" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {trending.slice(0, 5).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                initialFavorite={favIds.includes(movie.id)}
                initialWatchlist={watchIds.includes(movie.id)}
                onStateChange={handleStateChange}
              />
            ))}
            {trending.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400">No movies trending right now.</div>
            )}
          </div>
        </div>

        {/* Popular Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Most Popular</h2>
            </div>
            <Link href="/search?status=Popular" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {popular.slice(0, 5).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                initialFavorite={favIds.includes(movie.id)}
                initialWatchlist={watchIds.includes(movie.id)}
                onStateChange={handleStateChange}
              />
            ))}
            {popular.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400">No popular movies listed.</div>
            )}
          </div>
        </div>

        {/* Top Rated Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
                <Trophy className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Top Rated Masterpieces</h2>
            </div>
            <Link href="/search?status=Top+Rated" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {topRated.slice(0, 5).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                initialFavorite={favIds.includes(movie.id)}
                initialWatchlist={watchIds.includes(movie.id)}
                onStateChange={handleStateChange}
              />
            ))}
            {topRated.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400">No top rated movies listed.</div>
            )}
          </div>
        </div>

        {/* Upcoming Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Highly Anticipated Upcoming</h2>
            </div>
            <Link href="/search?status=Upcoming" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {upcoming.slice(0, 5).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                initialFavorite={favIds.includes(movie.id)}
                initialWatchlist={watchIds.includes(movie.id)}
                onStateChange={handleStateChange}
              />
            ))}
            {upcoming.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-400">No upcoming movies listed.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
