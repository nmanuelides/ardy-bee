import "server-only";
import { tmdbFetch } from "./client";
import type { TmdbPersonDetails } from "./types";

/** Full details for a single person (actor). */
export async function getPersonDetails(id: number): Promise<TmdbPersonDetails> {
  return tmdbFetch<TmdbPersonDetails>(`/person/${id}`, { language: "en-US" });
}
