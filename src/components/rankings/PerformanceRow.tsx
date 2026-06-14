import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import type { PerformanceRank } from "@/lib/rankings/queries";
import styles from "./rankings.module.scss";

export default function PerformanceRow({
  rank,
  perf,
  scoreLabel = "weighted",
}: {
  rank: number;
  perf: PerformanceRank;
  /** "weighted" for global rankings, "your score" for personal. */
  scoreLabel?: string;
}) {
  const img = tmdbImage(perf.posterPath, "w185");
  const score = scoreLabel === "weighted" ? perf.weighted : (perf.ratingAvg ?? 0);
  const sub = perf.characterName
    ? `as ${perf.characterName} · ${perf.movieTitle}`
    : perf.movieTitle;

  return (
    <li className={styles.row}>
      <span className={styles.rank} data-top={rank <= 3 || undefined}>
        {rank}
      </span>
      <Link href={`/movies/${perf.movieId}`} className={styles.thumb}>
        {img && (
          <Image
            src={img}
            alt={perf.movieTitle}
            fill
            sizes="40px"
            className={styles.cover}
          />
        )}
      </Link>
      <span className={styles.info}>
        <span className={styles.name}>{perf.actorName}</span>
        <span className={styles.sub}>{sub}</span>
      </span>
      <span className={styles.score}>
        <span className={styles.scoreNum}>{score.toFixed(1)}</span>
        <span className={styles.scoreLabel}>{scoreLabel}</span>
      </span>
    </li>
  );
}
