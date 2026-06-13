import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbCredits,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPaginated,
} from "./types";

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

/** Full details for a single movie. */
export async function getMovieDetails(id: number): Promise<TmdbMovieDetails> {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, { language: "en-US" });
}

/** Cast + crew for a single movie. */
export async function getMovieCredits(id: number): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, { language: "en-US" });
}
