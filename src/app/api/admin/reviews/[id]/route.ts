import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, movies } from "@/db/schema";
import { eq, and, avg } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const { status } = await request.json(); // e.g. "approved" or "flagged"
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const [updatedReview] = await db
      .update(reviews)
      .set({ status })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Recalculate average rating for this movie
    const [avgResult] = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(and(eq(reviews.movieId, updatedReview.movieId), eq(reviews.status, "approved")));

    const average = parseFloat(Number(avgResult?.avgRating || 0).toFixed(1));

    await db
      .update(movies)
      .set({ rating: average })
      .where(eq(movies.id, updatedReview.movieId));

    return NextResponse.json({ success: true, review: updatedReview, newMovieRating: average });
  } catch (error: any) {
    console.error("Update review status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const [deletedReview] = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!deletedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Recalculate average rating for this movie
    const [avgResult] = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(and(eq(reviews.movieId, deletedReview.movieId), eq(reviews.status, "approved")));

    const average = parseFloat(Number(avgResult?.avgRating || 0).toFixed(1));

    await db
      .update(movies)
      .set({ rating: average })
      .where(eq(movies.id, deletedReview.movieId));

    return NextResponse.json({ success: true, message: "Review deleted successfully", newMovieRating: average });
  } catch (error: any) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
