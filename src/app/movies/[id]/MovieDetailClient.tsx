"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Star, Heart, Bookmark, Play, Video, Users, User, ArrowLeft, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  rating: number;
  reviewText: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl: string;
  };
}

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

interface MovieDetailClientProps {
  initialData: {
    movie: Movie;
    reviews: Review[];
    isFavorite: boolean;
    isInWatchlist: boolean;
  };
}

// Extract YouTube ID helper
function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch (err) {
    return "";
  }
}

export default function MovieDetailClient({ initialData }: MovieDetailClientProps) {
  const { user, addToast, theme } = useApp();
  const router = useRouter();

  const [movie, setMovie] = useState<Movie>(initialData.movie);
  const [reviewsList, setReviewsList] = useState<Review[]>(initialData.reviews);
  const [isFavorite, setIsFavorite] = useState(initialData.isFavorite);
  const [isInWatchlist, setIsInWatchlist] = useState(initialData.isInWatchlist);

  // Form State
  const [rating, setRating] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync state if initialData changes
  useEffect(() => {
    setMovie(initialData.movie);
    setReviewsList(initialData.reviews);
    setIsFavorite(initialData.isFavorite);
    setIsInWatchlist(initialData.isInWatchlist);
  }, [initialData]);

  const handleToggleFavorite = async () => {
    if (!user) {
      addToast("Please sign in to save favorites!", "info");
      return;
    }

    try {
      const prev = isFavorite;
      setIsFavorite(!prev);

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setIsFavorite(data.added);
      addToast(data.message, "success");
    } catch (err) {
      setIsFavorite(isFavorite);
      addToast("Failed to toggle favorite", "error");
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      addToast("Please sign in to save movies to your watchlist!", "info");
      return;
    }

    try {
      const prev = isInWatchlist;
      setIsInWatchlist(!prev);

      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie.id }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setIsInWatchlist(data.added);
      addToast(data.message, "success");
    } catch (err) {
      setIsInWatchlist(isInWatchlist);
      addToast("Failed to toggle watchlist", "error");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast("Please sign in to rate and review", "info");
      return;
    }

    if (!reviewText.trim()) {
      addToast("Please write a short review text", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/movies/${movie.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post review");

      // Append new review & update aggregate rating
      setReviewsList((prev) => [data.review, ...prev]);
      setMovie((prev) => ({ ...prev, rating: data.movieRating }));
      setReviewText("");
      setRating(10);
      addToast("Review submitted successfully! Thank you.", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

  return (
    <div className="flex-1 pb-16">
      
      {/* Parallax Backdrop Banner */}
      <div className="relative min-h-[400px] md:min-h-[500px] flex items-end">
        {/* Backdrop background */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4] blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/20 dark:via-slate-950/20 to-transparent" />
        </div>

        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-purple-600 border border-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-full backdrop-blur-md transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Banner Content (Movie overview) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            
            {/* Poster Card */}
            <div className="w-48 md:w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900 flex-shrink-0 bg-slate-950 hover:scale-105 transition-transform duration-300">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* General Meta Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                {movie.genre.split(",").map((g) => (
                  <span
                    key={g}
                    className="text-[10px] font-black tracking-wider uppercase bg-purple-600/90 text-white px-2.5 py-1 rounded-md"
                  >
                    {g.trim()}
                  </span>
                ))}
                <span className="text-[10px] font-black tracking-wider uppercase bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                  {movie.status}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                {movie.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">
                <div className="flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/25 text-sm">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-black">{movie.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">/ 10</span>
                </div>
                <span>•</span>
                <span>{movie.duration}</span>
                <span>•</span>
                <span>Released {movie.releaseYear}</span>
                <span>•</span>
                <span className="bg-slate-200/80 dark:bg-slate-800/80 px-2 py-1 rounded-md">{movie.language}</span>
              </div>

              {/* Action Buttons: Favorites/Watchlist Toggles */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 font-black text-sm px-5 py-3 rounded-full shadow-md transition-all ${
                    isFavorite
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${isFavorite ? "fill-white" : ""}`} />
                  <span>{isFavorite ? "In Favorites" : "Add to Favorites"}</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 font-black text-sm px-5 py-3 rounded-full shadow-md transition-all ${
                    isInWatchlist
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  }`}
                >
                  <Bookmark className={`h-4.5 w-4.5 ${isInWatchlist ? "fill-white" : ""}`} />
                  <span>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Synopsis & Trailer Player */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Synopsis box */}
          <div className={`p-6 md:p-8 rounded-3xl border ${
            theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <span>Synopsis</span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Trailer Embed video Player */}
          {embedUrl ? (
            <div className={`p-6 md:p-8 rounded-3xl border ${
              theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                <span>Watch Trailer</span>
              </h2>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <iframe
                  src={embedUrl}
                  title={`${movie.title} Trailer`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : movie.trailerUrl ? (
            <div className={`p-6 md:p-8 rounded-3xl border text-center ${
              theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <Video className="h-10 w-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Trailer Video Link Available</h3>
              <p className="text-sm text-slate-400 mb-4">You can stream this trailer on YouTube directly:</p>
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-2.5 rounded-full shadow transition-all"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Open YouTube Trailer</span>
              </a>
            </div>
          ) : null}

          {/* Interactive User Reviews section */}
          <div className={`p-6 md:p-8 rounded-3xl border ${
            theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <span>Reviews & Ratings ({reviewsList.length})</span>
              </h2>
            </div>

            {/* Create Review Form */}
            {user ? (
              <form onSubmit={handleSubmitReview} className="space-y-4 mb-8 pb-8 border-b border-inherit">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-purple-500"
                    />
                    <span className="text-sm font-bold text-purple-400">Share your review as {user.username}</span>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-400">Your Rating</span>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className={`p-2.5 text-xs font-black rounded-lg border outline-none text-amber-500 bg-slate-950 border-slate-800`}
                    >
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={10 - i}>{10 - i} / 10 Star Rating</option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your honest movie critique, theories, or reactions here..."
                  rows={4}
                  className={`w-full p-4 text-sm rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    theme === "dark"
                      ? "bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? "Posting Review..." : "Submit Review"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-500/5 text-center mb-8 border border-purple-500/10">
                <p className="text-sm text-slate-400 mb-2">Want to write a review? Sign in to express your voice!</p>
                <Link
                  href="/auth"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* List of Reviews */}
            <div className="space-y-6">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="flex gap-4 p-4 rounded-2xl bg-slate-900/20 border border-slate-800">
                  <img
                    src={rev.user.avatarUrl}
                    alt={rev.user.username}
                    className="w-10 h-10 rounded-full object-cover border border-purple-500 bg-slate-950 p-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm truncate text-purple-400">{rev.user.username}</h4>
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-500/15">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{rev.rating} / 10</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {rev.reviewText}
                    </p>
                  </div>
                </div>
              ))}

              {reviewsList.length === 0 && (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-3xl">
                  <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="font-bold text-sm">No Reviews Yet</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to review this cinematic piece!</p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Cast, Crew & General Meta Specs */}
        <div className="space-y-8">
          
          {/* Director & Cast Panel */}
          <div className={`p-6 md:p-8 rounded-3xl border ${
            theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-lg font-black mb-5 pb-3 border-b border-inherit flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Cast & Crew</span>
            </h3>

            {/* Director */}
            <div className="mb-6">
              <span className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Director</span>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="p-2 rounded-xl bg-purple-600/10 text-purple-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{movie.director}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Head Director</p>
                </div>
              </div>
            </div>

            {/* Cast list */}
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Principal Cast</span>
              <div className="space-y-2.5">
                {movie.cast.split(",").map((actor) => (
                  <div
                    key={actor}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/30 hover:bg-purple-600/5 hover:border-purple-500/10 border border-transparent transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-400">
                      {actor.trim().charAt(0)}
                    </div>
                    <span className="text-xs font-bold">{actor.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details specs Panel */}
          <div className={`p-6 md:p-8 rounded-3xl border ${
            theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
          }`}>
            <h3 className="text-lg font-black mb-5 pb-3 border-b border-inherit">
              <span>Production Specifications</span>
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-black uppercase text-slate-400">Original Language</span>
                <span className="text-sm font-bold mt-1 block text-purple-400">{movie.language}</span>
              </div>
              <div>
                <span className="block text-xs font-black uppercase text-slate-400">Duration</span>
                <span className="text-sm font-bold mt-1 block">{movie.duration}</span>
              </div>
              <div>
                <span className="block text-xs font-black uppercase text-slate-400">Release Year</span>
                <span className="text-sm font-bold mt-1 block">{movie.releaseYear}</span>
              </div>
              <div>
                <span className="block text-xs font-black uppercase text-slate-400">Status Category</span>
                <span className="text-sm font-bold mt-1 block text-emerald-500">{movie.status}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
