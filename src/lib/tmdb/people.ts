import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbPersonDetails, TmdbPersonMovieCredits } from "./types";

/** Full details for a single person (actor). */
export async function getPersonDetails(id: number): Promise<TmdbPersonDetails> {
  return tmdbFetch<TmdbPersonDetails>(`/person/${id}`, { language: "en-US" });
}

/** Every movie a person has acted in (their cast credits). */
export async function getPersonMovieCredits(
  id: number,
): Promise<TmdbPersonMovieCredits> {
  return tmdbFetch<TmdbPersonMovieCredits>(`/person/${id}/movie_credits`, {
    language: "en-US",
  });
}
