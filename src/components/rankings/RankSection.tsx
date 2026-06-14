import type { ReactNode } from "react";
import styles from "./rankings.module.scss";

interface RankSectionProps {
  title: string;
  subtitle?: string;
  isEmpty: boolean;
  emptyLabel: string;
  children: ReactNode;
}

export default function RankSection({
  title,
  subtitle,
  isEmpty,
  emptyLabel,
  children,
}: RankSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {isEmpty ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ol className={styles.list}>{children}</ol>
      )}
    </section>
  );
}
