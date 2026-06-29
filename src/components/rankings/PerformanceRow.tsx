import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import { getT } from "@/lib/i18n/server";
import type { PerformanceRank } from "@/lib/rankings/queries";
import styles from "./rankings.module.scss";

export default async function PerformanceRow({
  rank,
  perf,
  personal = false,
}: {
  rank: number;
  perf: PerformanceRank;
  /** Personal section shows the user's own score; otherwise the weighted one. */
  personal?: boolean;
}) {
  const t = await getT();
  const img = tmdbImage(perf.posterPath, "w185");
  const score = personal ? (perf.ratingAvg ?? 0) : perf.weighted;
  const scoreLabel = personal ? t.rankings.yourScore : t.rankings.weighted;
  const sub = perf.characterName
    ? `${t.movie.as} ${perf.characterName} · ${perf.movieTitle}`
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
