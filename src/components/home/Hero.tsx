import Button from "@/components/ui/Button";
import BeeMascot from "@/components/brand/BeeMascot";
import { ratingLabel } from "@/lib/ratings";
import styles from "./Hero.module.scss";

export default function Hero() {
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

      {/* Floating preview card — demonstrates the rating language. */}
      <aside className={styles.card} aria-hidden="true">
        <BeeMascot />
        <div className={styles.cardTop}>
          <div className={styles.poster} />
          <div>
            <p className={styles.role}>as Furiosa</p>
            <p className={styles.name}>Anya Taylor-Joy</p>
          </div>
        </div>

        <div className={styles.dial}>
          <span className={styles.score}>8.5</span>
          <span className={styles.label}>{ratingLabel(8.5)}</span>
        </div>

        <div className={styles.sting}>
          <span className={styles.stingDot} />
          A score of 1 means it <strong>stings</strong>.
        </div>
      </aside>
    </section>
  );
}
