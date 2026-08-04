"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Film,
  Users,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
  Star,
  Shield,
  ArrowRightLeft,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

type TabOption = "movies" | "users" | "reviews";

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

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
}

interface ReviewData {
  id: number;
  rating: number;
  reviewText: string;
  status: string;
  createdAt: string;
  movie: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export default function AdminDashboardClient() {
  const { user, theme, addToast } = useApp();
  const router = useRouter();

  // Active tab inside sidebar
  const [activeTab, setActiveTab] = useState<TabOption>("movies");

  // Data States
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [usersList, setUserDataList] = useState<UserData[]>([]);
  const [reviewsList, setReviewsDataList] = useState<ReviewData[]>([]);

  // Search/Filters within tables
  const [movieSearch, setMovieSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");

  // Loading flags
  const [loading, setLoading] = useState(true);

  // Movie Form Dialog Modal state
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("");
  const [formSynopsis, setFormSynopsis] = useState("");
  const [formPoster, setFormPoster] = useState("");
  const [formBackdrop, setFormBackdrop] = useState("");
  const [formRating, setFormRating] = useState("8.0");
  const [formDirector, setFormDirector] = useState("");
  const [formCast, setFormCast] = useState("");
  const [formGenre, setFormGenre] = useState("");
  const [formLanguage, setFormLanguage] = useState("English");
  const [formYear, setFormYear] = useState("2024");
  const [formDuration, setFormDuration] = useState("120 mins");
  const [formTrailer, setFormTrailer] = useState("");
  const [formStatus, setFormStatus] = useState("Popular");
  const [savingMovie, setSavingMovie] = useState(false);

  // Fetch functions
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch movies
      const movieRes = await fetch("/api/movies?limit=100");
      if (movieRes.ok) {
        const data = await movieRes.json();
        setMoviesList(data.movies || []);
      }

      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUserDataList(data.users || []);
      }

      // Fetch reviews
      const reviewsRes = await fetch("/api/admin/reviews");
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviewsDataList(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch admin catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== "admin") {
        addToast("Unauthorized. Admin panel access restricted.", "error");
        router.push("/");
      } else {
        fetchAllData();
      }
    }
  }, [user]);

  // Open modal for Creating new movie
  const handleOpenCreateModal = () => {
    setEditingMovie(null);
    setFormTitle("");
    setFormSynopsis("");
    setFormPoster("https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400");
    setFormBackdrop("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1200");
    setFormRating("8.0");
    setFormDirector("");
    setFormCast("");
    setFormGenre("Action, Drama");
    setFormLanguage("English");
    setFormYear("2024");
    setFormDuration("120 mins");
    setFormTrailer("");
    setFormStatus("Popular");
    setIsMovieModalOpen(true);
  };

  // Open modal for Editing existing movie
  const handleOpenEditModal = (mv: Movie) => {
    setEditingMovie(mv);
    setFormTitle(mv.title);
    setFormSynopsis(mv.synopsis);
    setFormPoster(mv.posterUrl);
    setFormBackdrop(mv.backdropUrl);
    setFormRating(mv.rating.toString());
    setFormDirector(mv.director);
    setFormCast(mv.cast);
    setFormGenre(mv.genre);
    setFormLanguage(mv.language);
    setFormYear(mv.releaseYear.toString());
    setFormDuration(mv.duration);
    setFormTrailer(mv.trailerUrl || "");
    setFormStatus(mv.status);
    setIsMovieModalOpen(true);
  };

  // Submit Movie CRUD (create or update)
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSynopsis || !formPoster || !formBackdrop || !formDirector || !formCast || !formGenre || !formLanguage || !formYear || !formDuration) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setSavingMovie(true);
      const url = editingMovie ? `/api/movies/${editingMovie.id}` : "/api/movies";
      const method = editingMovie ? "PUT" : "POST";

      const moviePayload = {
        title: formTitle,
        synopsis: formSynopsis,
        posterUrl: formPoster,
        backdropUrl: formBackdrop,
        rating: parseFloat(formRating),
        director: formDirector,
        cast: formCast,
        genre: formGenre,
        language: formLanguage,
        releaseYear: parseInt(formYear),
        duration: formDuration,
        trailerUrl: formTrailer,
        status: formStatus,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moviePayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save movie");

      addToast(editingMovie ? "Movie updated successfully!" : "Movie created successfully!", "success");
      setIsMovieModalOpen(false);
      setEditingMovie(null);
      
      // Reload lists
      fetchAllData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSavingMovie(false);
    }
  };

  // Delete movie
  const handleDeleteMovie = async (movieId: number) => {
    if (!confirm("Are you sure you want to permanently delete this movie? This will delete all connected reviews.")) return;

    try {
      const res = await fetch(`/api/movies/${movieId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete movie");

      addToast("Movie deleted successfully", "success");
      setMoviesList((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Change user Role
  const handleToggleUserRole = async (u: UserData) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change role of ${u.username} to ${nextRole}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: nextRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change user role");

      addToast(`Role of ${u.username} changed to ${nextRole}`, "success");
      setUserDataList((prev) =>
        prev.map((usr) => (usr.id === u.id ? { ...usr, role: nextRole } : usr))
      );
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}? This will erase their reviews, watchlist, and favorites.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      addToast(`User ${username} deleted successfully`, "success");
      setUserDataList((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Moderate Review (approve/flag)
  const handleModerateReview = async (reviewId: number, nextStatus: "approved" | "flagged") => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to moderate review");

      addToast(`Review marked as ${nextStatus}`, "success");
      setReviewsDataList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: nextStatus } : r))
      );
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      addToast("Review deleted successfully", "success");
      setReviewsDataList((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  // Filter lists based on search bars
  const filteredMovies = moviesList.filter((m) =>
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.director.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.genre.toLowerCase().includes(movieSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredReviews = reviewsList.filter((r) =>
    r.reviewText.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.movie.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.user.username.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500">
        Checking admin authentication status...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r p-6 space-y-8 ${
        theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2.5 pb-4 border-b border-inherit">
          <Settings className="h-5 w-5 text-purple-500 animate-spin-slow" />
          <h1 className="text-lg font-black tracking-tight uppercase">Admin Console</h1>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("movies")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "movies"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Film className="h-4.5 w-4.5" />
            <span>Movie Catalog CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "users"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "reviews"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Review Moderation</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* Loading overlay state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Catalog Panel */}
        {!loading && activeTab === "movies" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Movie Catalog Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add, Edit, or delete movies from CinemaHub</p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/10 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Movie</span>
              </button>
            </div>

            {/* Movie Catalog Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search catalog..."
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl outline-none border focus:ring-2 focus:ring-purple-500 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Movie List Table */}
            <div className={`overflow-x-auto rounded-2xl border ${
              theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-inherit text-xs font-black uppercase text-slate-400 bg-slate-950/20">
                    <th className="p-4">Movie Info</th>
                    <th className="p-4">Director</th>
                    <th className="p-4">Specs</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredMovies.map((mv) => (
                    <tr key={mv.id} className="text-sm hover:bg-slate-800/10">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={mv.posterUrl}
                          alt={mv.title}
                          className="w-9 h-12 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold truncate max-w-xs">{mv.title}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{mv.genre}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">{mv.director}</td>
                      <td className="p-4 text-xs text-slate-400">
                        <div>{mv.releaseYear} • {mv.duration}</div>
                        <div>{mv.language}</div>
                      </td>
                      <td className="p-4 font-bold text-amber-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>{mv.rating.toFixed(1)}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-purple-600/15 text-purple-400 font-bold text-xs px-2.5 py-1 rounded-md">
                          {mv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(mv)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-400 hover:text-purple-300"
                            title="Edit movie"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(mv.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 hover:text-rose-400"
                            title="Delete movie"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMovies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No movies match your search term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Management Panel */}
        {!loading && activeTab === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Registered Member Directories</h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle privileges or delete accounts</p>
            </div>

            {/* Users Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search registered members..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl outline-none border focus:ring-2 focus:ring-purple-500 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Users list table */}
            <div className={`overflow-x-auto rounded-2xl border ${
              theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-inherit text-xs font-black uppercase text-slate-400 bg-slate-950/20">
                    <th className="p-4">User</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Role Privileges</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="text-sm hover:bg-slate-800/10">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover border border-purple-500 bg-slate-950 p-0.5"
                        />
                        <span className="font-bold">{u.username}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          <Shield className="h-3 w-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-400 hover:text-purple-300"
                            title="Toggle user role (Admin <-> User)"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 hover:text-rose-400"
                            title="Delete user account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No users match your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Moderation Panel */}
        {!loading && activeTab === "reviews" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Review Moderation Desk</h2>
              <p className="text-xs text-slate-400 mt-0.5">Approve, flag, or remove posted movie reviews</p>
            </div>

            {/* Review Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search reviews content..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl outline-none border focus:ring-2 focus:ring-purple-500 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Review Table list */}
            <div className={`overflow-x-auto rounded-2xl border ${
              theme === "dark" ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-inherit text-xs font-black uppercase text-slate-400 bg-slate-950/20">
                    <th className="p-4">Movie & Author</th>
                    <th className="p-4">Critique Summary</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredReviews.map((r) => (
                    <tr key={r.id} className="text-sm hover:bg-slate-800/10">
                      <td className="p-4">
                        <div className="font-bold text-slate-200 truncate max-w-xs">{r.movie.title}</div>
                        <div className="text-xs text-purple-400 mt-0.5">by {r.user.username}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-400 max-w-sm">
                        <p className="line-clamp-2 italic">"{r.reviewText}"</p>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span>{r.rating} / 10</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          r.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {r.status !== "approved" && (
                            <button
                              onClick={() => handleModerateReview(r.id, "approved")}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500 hover:text-emerald-400"
                              title="Approve Review"
                            >
                              <CheckCircle className="h-4.5 w-4.5" />
                            </button>
                          )}
                          {r.status !== "flagged" && (
                            <button
                              onClick={() => handleModerateReview(r.id, "flagged")}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 hover:text-amber-400"
                              title="Flag / Unapprove Review"
                            >
                              <AlertTriangle className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 hover:text-rose-400"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReviews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No reviews found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* CRUD Form Dialog Overlay modal */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`max-w-2xl w-full rounded-3xl p-6 md:p-8 space-y-6 relative border max-h-[90vh] overflow-y-auto ${
            theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <button
              onClick={() => setIsMovieModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-black tracking-tight border-b pb-3 border-inherit">
              {editingMovie ? `Edit Movie Specs: ${editingMovie.title}` : "Insert New Blockbuster Movie"}
            </h3>

            <form onSubmit={handleSaveMovie} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Dune: Part Two"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Director *</label>
                  <input
                    type="text"
                    required
                    value={formDirector}
                    onChange={(e) => setFormDirector(e.target.value)}
                    placeholder="e.g. Denis Villeneuve"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">Synopsis Description *</label>
                <textarea
                  required
                  value={formSynopsis}
                  onChange={(e) => setFormSynopsis(e.target.value)}
                  placeholder="Insert a short plot synopsis..."
                  rows={3}
                  className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Cast (Comma Separated) *</label>
                  <input
                    type="text"
                    required
                    value={formCast}
                    onChange={(e) => setFormCast(e.target.value)}
                    placeholder="Timothée Chalamet, Zendaya, Rebecca Ferguson"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Genre Tags (Comma Separated) *</label>
                  <input
                    type="text"
                    required
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    placeholder="Sci-Fi, Adventure, Action"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Language *</label>
                  <input
                    type="text"
                    required
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    placeholder="e.g. English"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Release Year *</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 148 mins"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Aggregate Score *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    required
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    placeholder="e.g. 8.5"
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Poster URL *</label>
                  <input
                    type="text"
                    required
                    value={formPoster}
                    onChange={(e) => setFormPoster(e.target.value)}
                    placeholder="https://..."
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Backdrop Banner URL *</label>
                  <input
                    type="text"
                    required
                    value={formBackdrop}
                    onChange={(e) => setFormBackdrop(e.target.value)}
                    placeholder="https://..."
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">YouTube Trailer URL</label>
                  <input
                    type="text"
                    value={formTrailer}
                    onChange={(e) => setFormTrailer(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">Category Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === "dark" ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <option value="Trending">Trending</option>
                    <option value="Popular">Popular</option>
                    <option value="Top Rated">Top Rated</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setIsMovieModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMovie}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  {savingMovie ? "Saving Movie..." : "Save Movie Specs"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
