import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies, reviews, favorites, watchlist, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const [movie] = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId));

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Fetch approved reviews for this movie
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

    // Check user states (favorite / watchlist) if logged in
    const currentUser = await getCurrentUser();
    let isFavorite = false;
    let isInWatchlist = false;

    if (currentUser) {
      const favs = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, currentUser.id), eq(favorites.movieId, movieId)));
      isFavorite = favs.length > 0;

      const watch = await db
        .select()
        .from(watchlist)
        .where(and(eq(watchlist.userId, currentUser.id), eq(watchlist.movieId, movieId)));
      isInWatchlist = watch.length > 0;
    }

    return NextResponse.json({
      movie,
      reviews: movieReviews,
      isFavorite,
      isInWatchlist,
    });
  } catch (error: any) {
    console.error("Fetch movie detail error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      synopsis,
      posterUrl,
      backdropUrl,
      rating,
      director,
      cast,
      genre,
      language,
      releaseYear,
      trailerUrl,
      duration,
      status,
    } = body;

    const [updatedMovie] = await db
      .update(movies)
      .set({
        title,
        synopsis,
        posterUrl,
        backdropUrl,
        rating: rating ? parseFloat(rating.toString()) : undefined,
        director,
        cast,
        genre,
        language,
        releaseYear: releaseYear ? parseInt(releaseYear.toString()) : undefined,
        trailerUrl,
        duration,
        status,
      })
      .where(eq(movies.id, movieId))
      .returning();

    if (!updatedMovie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, movie: updatedMovie });
  } catch (error: any) {
    console.error("Update movie error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const [deletedMovie] = await db
      .delete(movies)
      .where(eq(movies.id, movieId))
      .returning();

    if (!deletedMovie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Movie deleted successfully" });
  } catch (error: any) {
    console.error("Delete movie error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
