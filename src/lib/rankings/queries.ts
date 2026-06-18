import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ActorRank {
  personId: number;
  name: string;
  profilePath: string | null;
  totalRatings: number;
  ratedPerformances: number;
  avgScore: number | null;
  weighted: number;
}

export interface PerformanceRank {
  performanceId: number;
  movieId: number;
  personId: number;
  actorName: string;
  profilePath: string | null;
  characterName: string | null;
  movieTitle: string;
  posterPath: string | null;
  ratingCount: number;
  ratingAvg: number | null;
  weighted: number;
}

export interface MovieRank {
  movieId: number;
  title: string;
  posterPath: string | null;
  totalRatings: number;
  avgScore: number | null;
  weighted: number;
}

/** Ardy's own score for a movie, derived from the ratings of its performances. */
export interface MovieScore {
  /** Mean of every performance rating in the movie. */
  avg: number;
  /** How many distinct performances have at least one rating. */
  ratedPerformances: number;
}

const num = (v: unknown): number => (v == null ? 0 : Number(v));
const numOrNull = (v: unknown): number | null => (v == null ? null : Number(v));

export async function getTopActors(limit = 20): Promise<ActorRank[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("actor_rankings")
    .select("*")
    .order("weighted_score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    personId: r.person_id,
    name: r.name,
    profilePath: r.profile_path,
    totalRatings: num(r.total_ratings),
    ratedPerformances: num(r.rated_performances),
    avgScore: numOrNull(r.avg_score),
    weighted: num(r.weighted_score),
  }));
}

export async function getTopPerformances(limit = 20): Promise<PerformanceRank[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("performance_rankings")
    .select("*")
    .order("weighted_score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    performanceId: r.performance_id,
    movieId: r.movie_id,
    personId: r.person_id,
    actorName: r.actor_name,
    profilePath: r.profile_path,
    characterName: r.character_name,
    movieTitle: r.movie_title,
    posterPath: r.poster_path,
    ratingCount: num(r.rating_count),
    ratingAvg: numOrNull(r.rating_avg),
    weighted: num(r.weighted_score),
  }));
}

export async function getTopMovies(limit = 20): Promise<MovieRank[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movie_rankings")
    .select("*")
    .order("weighted_score", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    movieId: r.movie_id,
    title: r.title,
    posterPath: r.poster_path,
    totalRatings: num(r.total_ratings),
    avgScore: numOrNull(r.avg_score),
    weighted: num(r.weighted_score),
  }));
}

/**
 * Ardy scores for a set of TMDb movie ids (movies.id IS the TMDb id), keyed by
 * id. Returns a plain object so it can cross the server→client boundary (used
 * by the client-side browse grid). Movies with no ratings are simply absent.
 */
export async function getMovieScores(
  movieIds: number[],
): Promise<Record<number, MovieScore>> {
  const out: Record<number, MovieScore> = {};
  if (movieIds.length === 0) return out;

  const supabase = await createClient();
  const { data } = await supabase
    .from("movie_rankings")
    .select("movie_id, avg_score, rated_performances")
    .in("movie_id", movieIds);

  for (const r of data ?? []) {
    if (r.avg_score == null) continue;
    out[r.movie_id] = {
      avg: Number(r.avg_score),
      ratedPerformances: num(r.rated_performances),
    };
  }
  return out;
}

/** The signed-in user's own performances, ranked by the score they gave. */
export async function getMyTopPerformances(
  limit = 20,
): Promise<PerformanceRank[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ratings")
    .select(
      "score, performances!inner(id, character_name, movie_id, person_id, people!inner(name, profile_path), movies!inner(title, poster_path))",
    )
    .eq("user_id", user.id)
    .order("score", { ascending: false })
    .limit(limit);

  // PostgREST returns to-one embeds as objects.
  return (data ?? []).map((r): PerformanceRank => {
    const perf = r.performances as unknown as {
      id: number;
      character_name: string | null;
      movie_id: number;
      person_id: number;
      people: { name: string; profile_path: string | null };
      movies: { title: string; poster_path: string | null };
    };
    return {
      performanceId: perf.id,
      movieId: perf.movie_id,
      personId: perf.person_id,
      actorName: perf.people.name,
      profilePath: perf.people.profile_path,
      characterName: perf.character_name,
      movieTitle: perf.movies.title,
      posterPath: perf.movies.poster_path,
      ratingCount: 1,
      ratingAvg: Number(r.score),
      weighted: Number(r.score),
    };
  });
}
