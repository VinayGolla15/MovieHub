import { db } from "@/db";
import { movies, reviews, favorites, watchlist, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import MovieDetailClient from "./MovieDetailClient";
import { notFound } from "next/navigation";

export const revalidate = 0; // Ensure fresh content on load

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    return notFound();
  }

  // Fetch movie
  const [movie] = await db
    .select()
    .from(movies)
    .where(eq(movies.id, movieId));

  if (!movie) {
    return notFound();
  }

  // Fetch approved reviews with user metadata
  const movieReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      reviewText: reviews.reviewText,
      status: reviews.status,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.movieId, movieId), eq(reviews.status, "approved")))
    .orderBy(reviews.createdAt);

  // Check watchlist and favorite status
  const currentUser = await getCurrentUser();
  let isFavorite = false;
  let isInWatchlist = false;

  if (currentUser) {
    const favs = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, currentUser.id), eq(favorites.movieId, movieId)));
    isFavorite = favs.length > 0;

    const watchs = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, currentUser.id), eq(watchlist.movieId, movieId)));
    isInWatchlist = watchs.length > 0;
  }

  // Reverse reviews to show newest first and format Date to string
  const sortedReviews = [...movieReviews].reverse().map((rev) => ({
    ...rev,
    createdAt: rev.createdAt.toISOString(),
  }));

  return (
    <MovieDetailClient
      initialData={{
        movie,
        reviews: sortedReviews,
        isFavorite,
        isInWatchlist,
      }}
    />
  );
}
