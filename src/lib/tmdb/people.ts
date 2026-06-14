import "server-only";
import { tmdbFetch } from "./client";
import type {
  TmdbPaginated,
  TmdbPerson,
  TmdbPersonDetails,
  TmdbPersonMovieCredits,
} from "./types";

/** Full details for a single person (actor). */
export async function getPersonDetails(id: number): Promise<TmdbPersonDetails> {
  return tmdbFetch<TmdbPersonDetails>(`/person/${id}`, { language: "en-US" });
}

/** Currently-popular people. */
export async function getPopularPeople(): Promise<TmdbPerson[]> {
  const data = await tmdbFetch<TmdbPaginated<TmdbPerson>>("/person/popular", {
    language: "en-US",
    page: 1,
  });
  return data.results;
}

/** Every movie a person has acted in (their cast credits). */
export async function getPersonMovieCredits(
  id: number,
): Promise<TmdbPersonMovieCredits> {
  return tmdbFetch<TmdbPersonMovieCredits>(`/person/${id}/movie_credits`, {
    language: "en-US",
  });
}
