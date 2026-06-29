import MovieSection from "@/components/movie/MovieSection";
import { getMoviesByCategory } from "@/lib/tmdb/movies";
import { getMovieScores } from "@/lib/rankings/queries";
import { getT } from "@/lib/i18n/server";
import styles from "./browse.module.scss";

export async function generateMetadata() {
  const t = await getT();
  return { title: t.meta.movies };
}

export default async function MoviesPage() {
  const t = await getT();
  const [pop, top, up] = await Promise.allSettled([
    getMoviesByCategory("popular"),
    getMoviesByCategory("top-rated"),
    getMoviesByCategory("upcoming"),
  ]);

  const empty = { results: [], page: 1, totalPages: 1 };
  const popular = pop.status === "fulfilled" ? pop.value : empty;
  const topRated = top.status === "fulfilled" ? top.value : empty;
  const upRaw = up.status === "fulfilled" ? up.value : empty;

  // TMDb's "upcoming" list includes already-released titles, so keep only
  // genuinely future releases, soonest first.
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = {
    ...upRaw,
    results: upRaw.results
      .filter((m) => m.release_date && m.release_date > today)
      .sort((a, b) => a.release_date.localeCompare(b.release_date)),
  };

  const sections = [
    { title: t.movies.popular, category: "popular" as const, data: popular },
    { title: t.movies.topRated, category: "top-rated" as const, data: topRated },
    {
      title: t.movies.comingSoon,
      category: "upcoming" as const,
      data: upcoming,
      sortByDate: true,
    },
  ].filter((s) => s.data.results.length > 0);

  // One batched score lookup for every movie across all visible sections.
  const scores = await getMovieScores(
    sections.flatMap((s) => s.data.results.map((m) => m.id)),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{t.movies.title}</h1>
        <p className={styles.lead}>{t.movies.lead}</p>
      </header>

      {sections.map((s) => (
        <MovieSection
          key={s.category}
          title={s.title}
          category={s.category}
          initialMovies={s.data.results}
          initialPage={s.data.page}
          totalPages={s.data.totalPages}
          initialScores={scores}
          sortByDate={s.sortByDate}
        />
      ))}
    </main>
  );
}
