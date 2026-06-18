import { NextResponse } from "next/server";
import {
  getMoviesByCategory,
  type MovieCategory,
} from "@/lib/tmdb/movies";
import { getMovieScores } from "@/lib/rankings/queries";

const VALID: MovieCategory[] = ["popular", "top-rated", "upcoming"];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category") as MovieCategory | null;
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  if (!category || !VALID.includes(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  try {
    const { results, page: current, totalPages } = await getMoviesByCategory(
      category,
      page,
    );

    // "upcoming" includes already-released titles — keep only future ones.
    let movies = results;
    if (category === "upcoming") {
      const today = new Date().toISOString().slice(0, 10);
      movies = results.filter((m) => m.release_date && m.release_date > today);
    }

    const scores = await getMovieScores(movies.map((m) => m.id));
    return NextResponse.json({ results: movies, page: current, totalPages, scores });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
