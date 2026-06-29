import { notFound } from "next/navigation";
import MovieHero from "@/components/movie/MovieHero";
import CastList from "@/components/movie/CastList";
import Reveal from "@/components/motion/Reveal";
import type { PerformanceStat } from "@/components/movie/CastMember";
import { getMovieCredits, getMovieDetails } from "@/lib/tmdb/movies";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT } from "@/lib/i18n/server";
import { TMDB_LANG } from "@/lib/i18n/config";
import styles from "./page.module.scss";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) notFound();

  const t = await getT();
  const locale = await getLocale();

  // Localize overview/genres/tagline to the active locale, but keep the movie
  // title in English (movie names are never translated). For English, one
  // fetch covers both.
  const [localized, enDetails, credits] = await Promise.all([
    getMovieDetails(movieId, TMDB_LANG[locale]).catch(() => null),
    locale === "en"
      ? Promise.resolve(null)
      : getMovieDetails(movieId, "en-US").catch(() => null),
    getMovieCredits(movieId).catch(() => ({ id: movieId, cast: [] })),
  ]);
  if (!localized) notFound();
  const details = enDetails
    ? { ...localized, title: enDetails.title }
    : localized;

  const cast = credits.cast.slice(0, 30);

  // Auth + existing rating data for this movie's performances.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfs } = await supabase
    .from("performances")
    .select("id, person_id, rating_count, rating_avg")
    .eq("movie_id", movieId);

  const perfByPerson = new Map<
    number,
    { id: number; count: number; avg: number | null }
  >();
  for (const p of perfs ?? []) {
    perfByPerson.set(p.person_id, {
      id: p.id,
      count: p.rating_count,
      avg: p.rating_avg != null ? Number(p.rating_avg) : null,
    });
  }

  const myByPerf = new Map<number, number>();
  if (user && perfs && perfs.length > 0) {
    const { data: myRatings } = await supabase
      .from("ratings")
      .select("performance_id, score")
      .eq("user_id", user.id)
      .in(
        "performance_id",
        perfs.map((p) => p.id),
      );
    for (const r of myRatings ?? []) {
      myByPerf.set(r.performance_id, Number(r.score));
    }
  }

  const stats: Record<number, PerformanceStat> = {};
  for (const member of cast) {
    const pp = perfByPerson.get(member.id);
    stats[member.id] = {
      avg: pp?.avg ?? null,
      count: pp?.count ?? 0,
      myScore: pp ? (myByPerf.get(pp.id) ?? null) : null,
    };
  }

  return (
    <main>
      <MovieHero details={details} />
      <Reveal>
        <section className={styles.cast}>
          <h2 className={styles.heading}>{t.movie.castHeading}</h2>
          {cast.length > 0 ? (
            <CastList
              movieId={movieId}
              cast={cast}
              stats={stats}
              isAuthenticated={!!user}
            />
          ) : (
            <p className={styles.empty}>{t.movie.noCast}</p>
          )}
        </section>
      </Reveal>
    </main>
  );
}
