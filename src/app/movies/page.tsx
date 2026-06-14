import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
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

  const sections = [
    { title: "Popular", movies: pop.status === "fulfilled" ? pop.value : [] },
    { title: "Top rated", movies: top.status === "fulfilled" ? top.value : [] },
    { title: "Coming soon", movies: up.status === "fulfilled" ? up.value : [] },
  ].filter((s) => s.movies.length > 0);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>Movies</h1>
          <p className={styles.lead}>
            Browse films and rate the performances inside them.
          </p>
        </header>

        {sections.map((s) => (
          <Reveal key={s.title}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{s.title}</h2>
              <div className={styles.grid}>
                {s.movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
