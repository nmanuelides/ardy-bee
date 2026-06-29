import Button from "@/components/ui/Button";
import HeroBoards from "./HeroBoards";
import { getT } from "@/lib/i18n/server";
import type { ActorRank, MovieRank } from "@/lib/rankings/queries";
import styles from "./Hero.module.scss";

export default async function Hero({
  topActors,
  topMovies,
}: {
  topActors: ActorRank[];
  topMovies: MovieRank[];
}) {
  const t = await getT();
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{t.home.eyebrow}</p>
        <h1 className={styles.headline}>
          {t.home.headlineLead} <em>{t.home.headlineEm}</em>
          {t.home.headlineTail}
        </h1>
        <p className={styles.sub}>{t.home.sub}</p>
        <div className={styles.ctas}>
          <Button variant="accent">{t.home.startRating}</Button>
          <Button variant="ghost">{t.home.exploreRankings}</Button>
        </div>
      </div>

      <HeroBoards actors={topActors} movies={topMovies} />
    </section>
  );
}
