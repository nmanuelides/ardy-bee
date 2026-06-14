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

/** Highest-rated movies of all time. */
export async function getTopRatedMovies(): Promise<TmdbMovie[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>("/movie/top_rated", {
    language: "en-US",
    page: 1,
  });
  return data.results;
}

export type MovieCategory = "popular" | "top-rated" | "upcoming";

const CATEGORY_PATH: Record<MovieCategory, string> = {
  popular: "/movie/popular",
  "top-rated": "/movie/top_rated",
  upcoming: "/movie/upcoming",
};

export interface MoviePage {
  results: TmdbMovie[];
  page: number;
  totalPages: number;
}

/** A single page of a movie category, for the browse grid + "See more". */
export async function getMoviesByCategory(
  category: MovieCategory,
  page = 1,
): Promise<MoviePage> {
  const data = await tmdbFetch<TmdbPaginated<TmdbMovie>>(
    CATEGORY_PATH[category],
    { language: "en-US", page },
  );
  return {
    results: data.results,
    page: data.page,
    totalPages: data.total_pages,
  };
}

/** Full details for a single movie. */
export async function getMovieDetails(id: number): Promise<TmdbMovieDetails> {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${id}`, { language: "en-US" });
}

/** Cast + crew for a single movie. */
export async function getMovieCredits(id: number): Promise<TmdbCredits> {
  return tmdbFetch<TmdbCredits>(`/movie/${id}/credits`, { language: "en-US" });
}
