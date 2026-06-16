import Button from "@/components/ui/Button";
import HeroBoards from "./HeroBoards";
import type { ActorRank, MovieRank } from "@/lib/rankings/queries";
import styles from "./Hero.module.scss";

export default function Hero({
  topActors,
  topMovies,
}: {
  topActors: ActorRank[];
  topMovies: MovieRank[];
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>ARDB · Actors Ratings Data Base</p>
        <h1 className={styles.headline}>
          Rate the <em>performance</em>, not the movie.
        </h1>
        <p className={styles.sub}>
          Score every actor&apos;s work from 1 to 10. The more you rate, the
          sharper your taste profile gets — and Ardy Bee surfaces films where
          your favorites share the screen.
        </p>
        <div className={styles.ctas}>
          <Button variant="accent">Start rating</Button>
          <Button variant="ghost">Explore rankings</Button>
        </div>
      </div>

      <HeroBoards actors={topActors} movies={topMovies} />
    </section>
  );
}
