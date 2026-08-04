import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, movies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const allReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        status: reviews.status,
        createdAt: reviews.createdAt,
        movie: {
          id: movies.id,
          title: movies.title,
        },
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        }
      })
      .from(reviews)
      .innerJoin(movies, eq(reviews.movieId, movies.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .orderBy(reviews.createdAt);

    return NextResponse.json({ reviews: allReviews });
  } catch (error: any) {
    console.error("Fetch reviews admin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
