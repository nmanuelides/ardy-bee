import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPersonMovieCredits } from "@/lib/tmdb/people";

export interface FavoriteActor {
  personId: number;
  name: string;
  avg: number;
  count: number;
}

export interface Recommendation {
  movieId: number;
  title: string;
  posterPath: string | null;
  year: string | null;
  popularity: number;
  featuring: { personId: number; name: string }[];
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  favorites: FavoriteActor[];
  isAuthenticated: boolean;
}

const FAVORITE_MIN_AVG = 7; // an actor you rated this well, on average, is a "favorite"
const MAX_FAVORITES = 12;

/**
 * The signed-in user's favorite actors, derived from the performances they've
 * rated highly (mean score >= FAVORITE_MIN_AVG).
 */
export async function getFavoriteActors(
  limit = MAX_FAVORITES,
): Promise<FavoriteActor[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ratings")
    .select("score, performances!inner(person_id, people!inner(name))")
    .eq("user_id", user.id);

  const byActor = new Map<number, { name: string; sum: number; count: number }>();
  for (const row of data ?? []) {
    const perf = row.performances as unknown as {
      person_id: number;
      people: { name: string };
    };
    const entry = byActor.get(perf.person_id) ?? {
      name: perf.people.name,
      sum: 0,
      count: 0,
    };
    entry.sum += Number(row.score);
    entry.count += 1;
    byActor.set(perf.person_id, entry);
  }

  return [...byActor.entries()]
    .map(([personId, e]) => ({
      personId,
      name: e.name,
      avg: e.sum / e.count,
      count: e.count,
    }))
    .filter((a) => a.avg >= FAVORITE_MIN_AVG)
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, limit);
}

/**
 * Movies where >= 2 of the user's favorite actors appear, ranked by how many
 * favorites share the screen, then by popularity.
 */
export async function getRecommendations(
  limit = 24,
): Promise<RecommendationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const favorites = await getFavoriteActors();
  if (favorites.length < 2) {
    return { recommendations: [], favorites, isAuthenticated };
  }

  const favName = new Map(favorites.map((f) => [f.personId, f.name]));

  const creditsArr = await Promise.all(
    favorites.map((f) => getPersonMovieCredits(f.personId).catch(() => null)),
  );

  // movieId -> aggregated movie data + set of favorites appearing in it
  const movies = new Map<
    number,
    {
      title: string;
      poster: string | null;
      release: string | null;
      popularity: number;
      featuring: Map<number, string>;
    }
  >();

  creditsArr.forEach((credits, idx) => {
    if (!credits) return;
    const personId = favorites[idx].personId;
    for (const m of credits.cast) {
      if (!m.id || !m.title) continue;
      let entry = movies.get(m.id);
      if (!entry) {
        entry = {
          title: m.title,
          poster: m.poster_path,
          release: m.release_date || null,
          popularity: m.popularity ?? 0,
          featuring: new Map(),
        };
        movies.set(m.id, entry);
      }
      entry.featuring.set(personId, favName.get(personId)!);
    }
  });

  const recommendations: Recommendation[] = [...movies.entries()]
    .filter(([, m]) => m.featuring.size >= 2)
    .map(([movieId, m]) => ({
      movieId,
      title: m.title,
      posterPath: m.poster,
      year: m.release ? m.release.slice(0, 4) : null,
      popularity: m.popularity,
      featuring: [...m.featuring.entries()].map(([personId, name]) => ({
        personId,
        name,
      })),
    }))
    .sort(
      (a, b) =>
        b.featuring.length - a.featuring.length || b.popularity - a.popularity,
    )
    .slice(0, limit);

  return { recommendations, favorites, isAuthenticated };
}
