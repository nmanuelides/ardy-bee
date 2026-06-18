"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMovieDetails } from "@/lib/tmdb/movies";
import { getPersonDetails } from "@/lib/tmdb/people";
import { MAX_RATING, MIN_RATING } from "@/lib/ratings";

export interface RatePerformanceInput {
  movieId: number;
  personId: number;
  characterName: string | null;
  creditOrder: number | null;
  score: number;
}

export type RateResult =
  | { ok: true }
  | { ok: false; error: string; needsAuth?: boolean };

function isValidScore(score: number): boolean {
  return (
    score >= MIN_RATING &&
    score <= MAX_RATING &&
    Number.isInteger(score * 2) // enforces 0.5 increments
  );
}

/**
 * Records a user's rating for an actor's performance in a movie.
 * Lazily caches the movie/person/performance rows (server-side, service-role)
 * the first time anyone rates that pairing, then upserts the user's rating.
 */
export async function ratePerformance(
  input: RatePerformanceInput,
): Promise<RateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in to rate.", needsAuth: true };
  }
  if (!isValidScore(input.score)) {
    return { ok: false, error: "Invalid score." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error: "Ratings aren't configured yet (missing server key).",
    };
  }

  // Cache movie + person from TMDb (authoritative data, not client-supplied).
  const [movie, person] = await Promise.all([
    getMovieDetails(input.movieId),
    getPersonDetails(input.personId),
  ]);

  const { error: movieErr } = await admin.from("movies").upsert({
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title ?? null,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date || null,
    runtime: movie.runtime,
    popularity: movie.popularity,
    tmdb_vote_average: movie.vote_average,
  });

  const { error: personErr } = await admin.from("people").upsert({
    id: person.id,
    name: person.name,
    profile_path: person.profile_path,
    known_for_department: person.known_for_department,
    popularity: person.popularity,
  });

  if (movieErr || personErr) {
    return {
      ok: false,
      error: `Could not cache film/actor. (${(movieErr ?? personErr)?.message})`,
    };
  }

  // Upsert the performance and get its id.
  const { data: performance, error: perfError } = await admin
    .from("performances")
    .upsert(
      {
        movie_id: movie.id,
        person_id: person.id,
        character_name: input.characterName,
        credit_order: input.creditOrder,
      },
      { onConflict: "movie_id,person_id" },
    )
    .select("id")
    .single();

  if (perfError || !performance) {
    return {
      ok: false,
      error: `Could not save the performance.${perfError ? ` (${perfError.message})` : ""}`,
    };
  }

  // Upsert the rating AS THE USER, so RLS owner checks apply.
  const { error: ratingError } = await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, performance_id: performance.id, score: input.score },
      { onConflict: "user_id,performance_id" },
    );

  if (ratingError) {
    return { ok: false, error: ratingError.message };
  }

  revalidatePath(`/movies/${input.movieId}`);
  return { ok: true };
}

/**
 * Removes the signed-in user's rating for a performance (identified by the
 * movie+person pairing). The ratings_aggregate trigger decrements the cached
 * counts on DELETE, so movie/actor scores self-correct. Idempotent: removing a
 * rating that doesn't exist still succeeds.
 */
export async function removeRating(input: {
  movieId: number;
  personId: number;
}): Promise<RateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in to manage ratings.", needsAuth: true };
  }

  // Find the performance for this movie+person (unique pairing).
  const { data: performance, error: perfError } = await supabase
    .from("performances")
    .select("id")
    .eq("movie_id", input.movieId)
    .eq("person_id", input.personId)
    .maybeSingle();

  if (perfError) {
    return { ok: false, error: perfError.message };
  }
  // No performance row → nothing was ever rated; already "removed".
  if (!performance) {
    return { ok: true };
  }

  // RLS (ratings_delete_own) ensures users can only delete their own rating.
  const { error: deleteError } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("performance_id", performance.id);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  revalidatePath(`/movies/${input.movieId}`);
  return { ok: true };
}
