import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { ilike, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await db
      .select({
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl,
        releaseYear: movies.releaseYear,
        rating: movies.rating,
        genre: movies.genre,
      })
      .from(movies)
      .where(ilike(movies.title, `%${query}%`))
      .limit(6);

    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
