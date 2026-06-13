import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbMovie, TmdbPaginated } from "./types";

/** Movies people are watching right now. */
export async function getPopularMovies(): Promise<TmdbMovie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/popular", {
    language: "en-US",
    page: 1,
  });
  return data.results;
}

/** Movies releasing soon. */
export async function getUpcomingMovies(): Promise<TmdbMovie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/upcoming", {
    language: "en-US",
    page: 1,
  });
  return data.results;
}
