import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, movies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favMovies = await db
      .select({
        movie: movies,
      })
      .from(favorites)
      .innerJoin(movies, eq(favorites.movieId, movies.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(favorites.createdAt);

    return NextResponse.json({ favorites: favMovies.map((f) => f.movie) });
  } catch (error: any) {
    console.error("Get favorites error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { movieId } = await request.json();
    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.movieId, movieId)));

    if (existing.length > 0) {
      // Remove it (toggle off)
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, user.id), eq(favorites.movieId, movieId)));
      return NextResponse.json({ success: true, added: false, message: "Removed from favorites" });
    } else {
      // Add it
      await db.insert(favorites).values({
        userId: user.id,
        movieId,
      });
      return NextResponse.json({ success: true, added: true, message: "Added to favorites" });
    }
  } catch (error: any) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
