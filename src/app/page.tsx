import { db } from "@/db";
import { movies, favorites, watchlist } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import HomePageClient from "./components/HomePageClient";
import { eq } from "drizzle-orm";

export const revalidate = 0; // Fresh content every time

export default async function HomePage() {
  // Fetch movie lists
  const allMovies = await db
    .select()
    .from(movies)
    .orderBy(movies.rating);

  // Fetch current user and their active states
  const currentUser = await getCurrentUser();
  let favoriteMovieIds: number[] = [];
  let watchlistMovieIds: number[] = [];

  if (currentUser) {
    const favs = await db
      .select({ movieId: favorites.movieId })
      .from(favorites)
      .where(eq(favorites.userId, currentUser.id));
    favoriteMovieIds = favs.map((f) => f.movieId);

    const watchs = await db
      .select({ movieId: watchlist.movieId })
      .from(watchlist)
      .where(eq(watchlist.userId, currentUser.id));
    watchlistMovieIds = watchs.map((w) => w.movieId);
  }

  // Reverse list order so highest ratings or newest entries look spectacular
  const sortedMovies = [...allMovies].reverse();

  return (
    <HomePageClient
      movies={sortedMovies}
      userFavorites={favoriteMovieIds}
      userWatchlist={watchlistMovieIds}
    />
  );
}
