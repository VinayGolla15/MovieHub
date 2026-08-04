import { NextResponse } from "next/server";
import { db } from "@/db";
import { movies } from "@/db/schema";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const genre = searchParams.get("genre") || "";
    const language = searchParams.get("language") || "";
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const rating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")!) : null;
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query) {
      conditions.push(ilike(movies.title, `%${query}%`));
    }

    if (genre) {
      conditions.push(ilike(movies.genre, `%${genre}%`));
    }

    if (language) {
      conditions.push(eq(movies.language, language));
    }

    if (year) {
      conditions.push(eq(movies.releaseYear, year));
    }

    if (rating) {
      conditions.push(gte(movies.rating, rating));
    }

    if (status) {
      conditions.push(eq(movies.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch movies
    const data = await db
      .select()
      .from(movies)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${movies.id} desc`);

    // Fetch total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(movies)
      .where(whereClause);

    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      movies: data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Fetch movies error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Admin check
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
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

    if (!title || !synopsis || !posterUrl || !backdropUrl || !director || !cast || !genre || !language || !releaseYear || !duration) {
      return NextResponse.json({ error: "Missing required movie fields" }, { status: 400 });
    }

    const [newMovie] = await db
      .insert(movies)
      .values({
        title,
        synopsis,
        posterUrl,
        backdropUrl,
        rating: rating || 0.0,
        director,
        cast,
        genre,
        language,
        releaseYear: parseInt(releaseYear.toString()),
        trailerUrl: trailerUrl || "",
        duration,
        status: status || "Popular",
      })
      .returning();

    return NextResponse.json({ success: true, movie: newMovie });
  } catch (error: any) {
    console.error("Create movie error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
