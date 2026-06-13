import styles from "./SectionRail.module.scss";

interface SectionRailProps {
  title: string;
  /** Number of placeholder skeleton cards to show until TMDb data lands. */
  count?: number;
}

/**
 * Horizontal content rail. Phase 1 renders skeletons; Phase 2 fills these
 * with real TMDb movie cards (Popular, Upcoming, etc.).
 */
export default function SectionRail({ title, count = 6 }: SectionRailProps) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.rail}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    </section>
  );
}
