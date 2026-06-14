import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbPaginated, TmdbSearchResult } from "./types";

/** Mixed movie + person search. */
export async function searchMulti(query: string): Promise<TmdbSearchResult[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<TmdbPaginated<TmdbSearchResult>>("/search/multi", {
    query,
    include_adult: false,
    language: "en-US",
    page: 1,
  });
  return data.results;
}
