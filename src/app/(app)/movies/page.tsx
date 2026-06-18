import MovieSection from "@/components/movie/MovieSection";
import { getMoviesByCategory } from "@/lib/tmdb/movies";
import { getMovieScores } from "@/lib/rankings/queries";
import styles from "./browse.module.scss";

export const metadata = { title: "Movies · Ardy Bee" };

export default async function MoviesPage() {
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
    { title: "Popular", category: "popular" as const, data: popular },
    { title: "Top rated", category: "top-rated" as const, data: topRated },
    {
      title: "Coming soon",
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
        <h1>Movies</h1>
        <p className={styles.lead}>
          Browse films and rate the performances inside them.
        </p>
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
