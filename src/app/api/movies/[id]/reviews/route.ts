import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, movies, users } from "@/db/schema";
import { eq, and, avg } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const { rating, reviewText } = await request.json();

    if (!rating || !reviewText) {
      return NextResponse.json({ error: "Rating and review text are required" }, { status: 400 });
    }

    const numericRating = parseInt(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 10) {
      return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
    }

    // Insert review. By default, it's approved unless flagged, but admin can moderate.
    const [newReview] = await db
      .insert(reviews)
      .values({
        userId: user.id,
        movieId,
        rating: numericRating,
        reviewText,
        status: "approved", // auto approved for instant feedback
      })
      .returning();

    // Re-calculate average rating for this movie
    const [avgResult] = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(and(eq(reviews.movieId, movieId), eq(reviews.status, "approved")));

    const average = parseFloat(Number(avgResult?.avgRating || numericRating).toFixed(1));

    // Update movie rating
    await db
      .update(movies)
      .set({ rating: average })
      .where(eq(movies.id, movieId));

    // Fetch user details for the return object
    const completeReview = {
      ...newReview,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      }
    };

    return NextResponse.json({ success: true, review: completeReview, movieRating: average });
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
