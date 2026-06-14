import Button from "@/components/ui/Button";
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

      {/* A single performance being rated — the core action, in Soft-UI. */}
      <aside className={styles.panel} aria-hidden="true">
        <div className={styles.panelHead}>
          <span className={styles.dot} />
          Now rating
        </div>

        <div className={styles.perf}>
          <span className={styles.poster} />
          <div className={styles.who}>
            <p className={styles.name}>Anya Taylor-Joy</p>
            <p className={styles.role}>as Furiosa · 2024</p>
          </div>
          <div className={styles.scoreBlock}>
            <span className={styles.score}>8.5</span>
            <span className={styles.label}>Stellar</span>
          </div>
        </div>

        <div className={styles.dialRow}>
          <div className={styles.track}>
            <span className={styles.fill} />
          </div>
          <span className={styles.orb}>
            <svg viewBox="0 0 24 24" width="22" height="22" className={styles.orbIcon}>
              <path d="M12 4l7 8h-4.2v6.5H9.2V12H5z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </aside>
    </section>
  );
}
