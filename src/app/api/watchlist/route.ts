import { NextResponse } from "next/server";
import { db } from "@/db";
import { watchlist, movies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const watchMovies = await db
      .select({
        movie: movies,
      })
      .from(watchlist)
      .innerJoin(movies, eq(watchlist.movieId, movies.id))
      .where(eq(watchlist.userId, user.id))
      .orderBy(watchlist.createdAt);

    return NextResponse.json({ watchlist: watchMovies.map((w) => w.movie) });
  } catch (error: any) {
    console.error("Get watchlist error:", error);
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

    // Check if already in watchlist
    const existing = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, user.id), eq(watchlist.movieId, movieId)));

    if (existing.length > 0) {
      // Remove it (toggle off)
      await db
        .delete(watchlist)
        .where(and(eq(watchlist.userId, user.id), eq(watchlist.movieId, movieId)));
      return NextResponse.json({ success: true, added: false, message: "Removed from watchlist" });
    } else {
      // Add it
      await db.insert(watchlist).values({
        userId: user.id,
        movieId,
      });
      return NextResponse.json({ success: true, added: true, message: "Added to watchlist" });
    }
  } catch (error: any) {
    console.error("Toggle watchlist error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
