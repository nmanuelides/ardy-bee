import RankSection from "@/components/rankings/RankSection";
import ActorRow from "@/components/rankings/ActorRow";
import PerformanceRow from "@/components/rankings/PerformanceRow";
import MovieRow from "@/components/rankings/MovieRow";
import Reveal from "@/components/motion/Reveal";
import {
  getMyTopPerformances,
  getTopActors,
  getTopMovies,
  getTopPerformances,
} from "@/lib/rankings/queries";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.scss";

export const metadata = {
  title: "Rankings · Ardy Bee",
};

export default async function RankingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [actors, performances, movies, mine] = await Promise.all([
    getTopActors(10),
    getTopPerformances(15),
    getTopMovies(10),
    getMyTopPerformances(10),
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Rankings</h1>
        <p className={styles.lead}>
            Ranked by a weighted score — a deep body of strong work outranks a
            single lucky 10. The more ratings, the more a score is trusted.
          </p>
        </header>

        {user && (
          <RankSection
            title="Your top performances"
            subtitle="by the score you gave"
            isEmpty={mine.length === 0}
            emptyLabel="You haven't rated anything yet. Open a movie and rate the cast!"
          >
            {mine.map((perf, i) => (
              <PerformanceRow
                key={perf.performanceId}
                rank={i + 1}
                perf={perf}
                scoreLabel="your score"
              />
            ))}
          </RankSection>
        )}

        <Reveal>
          <RankSection
            title="Best performances"
            subtitle="across the hive"
            isEmpty={performances.length === 0}
            emptyLabel="No performances ranked yet — be the first to rate one."
          >
            {performances.map((perf, i) => (
              <PerformanceRow key={perf.performanceId} rank={i + 1} perf={perf} />
            ))}
          </RankSection>
        </Reveal>

        <div className={styles.cols}>
          <RankSection
            title="Top actors"
            isEmpty={actors.length === 0}
            emptyLabel="No actors ranked yet — rate some performances to get the hive buzzing."
          >
            {actors.map((actor, i) => (
              <ActorRow key={actor.personId} rank={i + 1} actor={actor} />
            ))}
          </RankSection>

          <RankSection
            title="Best movies"
            subtitle="by ensemble"
            isEmpty={movies.length === 0}
            emptyLabel="No movies ranked yet — rate a cast to put a film on the board."
          >
            {movies.map((movie, i) => (
              <MovieRow key={movie.movieId} rank={i + 1} movie={movie} />
            ))}
          </RankSection>
        </div>
    </main>
  );
}
