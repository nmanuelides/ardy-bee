import MovieCard from "@/components/movie/MovieCard";
import Reveal from "@/components/motion/Reveal";
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
} from "@/lib/tmdb/movies";
import styles from "./browse.module.scss";

export const metadata = { title: "Movies · Ardy Bee" };

export default async function MoviesPage() {
  const [pop, top, up] = await Promise.allSettled([
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
  ]);

  // TMDb's "upcoming" list includes already-released titles, so keep only
  // genuinely future releases, soonest first.
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (up.status === "fulfilled" ? up.value : [])
    .filter((m) => m.release_date && m.release_date > today)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));

  const sections = [
    { title: "Popular", movies: pop.status === "fulfilled" ? pop.value : [] },
    { title: "Top rated", movies: top.status === "fulfilled" ? top.value : [] },
    { title: "Coming soon", movies: upcoming },
  ].filter((s) => s.movies.length > 0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Movies</h1>
        <p className={styles.lead}>
          Browse films and rate the performances inside them.
        </p>
      </header>

      {sections.map((s) => (
        <section key={s.title} className={styles.section}>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
          <Reveal stagger className={styles.grid}>
            {s.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Reveal>
        </section>
      ))}
    </main>
  );
}
