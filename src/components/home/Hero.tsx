import Button from "@/components/ui/Button";
import styles from "./Hero.module.scss";

// Decorative sample performances shown in the hero panel (high → stinger).
const TILES = [
  { score: "9.5", label: "Honey", grad: "linear-gradient(145deg, #f0a3d0, #d10076)" },
  { score: "8.0", label: "Stellar", grad: "linear-gradient(145deg, #6a2bd9, #d10076)" },
  { score: "1.0", label: "Stings", grad: "linear-gradient(145deg, #d10076, #300223)", sting: true },
];

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

      <aside className={styles.panel} aria-hidden="true">
        <div className={styles.panelHead}>
          <span className={styles.dot} />
          Now rating
        </div>

        <div className={styles.tiles}>
          {TILES.map((t) => (
            <div key={t.score} className={styles.tile} data-sting={t.sting || undefined}>
              <span className={styles.avatar} style={{ background: t.grad }} />
              <span className={styles.tileScore}>{t.score}</span>
              <span className={styles.tileLabel}>{t.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.orbRow}>
          <div className={styles.scale}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={styles.tick} data-active={i === 8 || undefined} />
            ))}
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
