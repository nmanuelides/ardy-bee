import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb/search";

export interface SearchHit {
  id: number;
  type: "movie" | "person";
  title: string;
  image: string | null;
  sub: string;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  try {
    const all = await searchMulti(q);
    const results: SearchHit[] = all
      .filter(
        (r) =>
          (r.media_type === "movie" && r.poster_path) ||
          (r.media_type === "person" && r.profile_path),
      )
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        type: r.media_type === "movie" ? "movie" : "person",
        title: r.title ?? r.name ?? "",
        image: r.media_type === "movie" ? (r.poster_path ?? null) : (r.profile_path ?? null),
        sub:
          r.media_type === "movie"
            ? (r.release_date ? r.release_date.slice(0, 4) : "Movie")
            : (r.known_for_department ?? "Actor"),
      }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
