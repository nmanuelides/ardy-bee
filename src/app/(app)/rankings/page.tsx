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
import { getT } from "@/lib/i18n/server";
import styles from "./page.module.scss";

export const metadata = {
  title: "Rankings · Ardy Bee",
};

export default async function RankingsPage() {
  const t = await getT();
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
        <h1>{t.rankings.title}</h1>
        <p className={styles.lead}>{t.rankings.lead}</p>
        </header>

        {user && (
          <RankSection
            title={t.rankings.yourTop}
            subtitle={t.rankings.yourTopSub}
            isEmpty={mine.length === 0}
            emptyLabel={t.rankings.emptyMine}
          >
            {mine.map((perf, i) => (
              <PerformanceRow
                key={perf.performanceId}
                rank={i + 1}
                perf={perf}
                personal
              />
            ))}
          </RankSection>
        )}

        <Reveal>
          <RankSection
            title={t.rankings.bestPerformances}
            subtitle={t.rankings.bestPerformancesSub}
            isEmpty={performances.length === 0}
            emptyLabel={t.rankings.emptyPerformances}
          >
            {performances.map((perf, i) => (
              <PerformanceRow key={perf.performanceId} rank={i + 1} perf={perf} />
            ))}
          </RankSection>
        </Reveal>

        <div className={styles.cols}>
          <RankSection
            title={t.rankings.topActors}
            isEmpty={actors.length === 0}
            emptyLabel={t.rankings.emptyActors}
          >
            {actors.map((actor, i) => (
              <ActorRow key={actor.personId} rank={i + 1} actor={actor} />
            ))}
          </RankSection>

          <RankSection
            title={t.rankings.bestMovies}
            subtitle={t.rankings.bestMoviesSub}
            isEmpty={movies.length === 0}
            emptyLabel={t.rankings.emptyMovies}
          >
            {movies.map((movie, i) => (
              <MovieRow key={movie.movieId} rank={i + 1} movie={movie} />
            ))}
          </RankSection>
        </div>
    </main>
  );
}
