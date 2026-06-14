import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/image";
import type { ActorRank } from "@/lib/rankings/queries";
import styles from "./rankings.module.scss";

export default function ActorRow({
  rank,
  actor,
}: {
  rank: number;
  actor: ActorRank;
}) {
  const img = tmdbImage(actor.profilePath, "w185");
  const perfLabel = `${actor.ratedPerformances} performance${actor.ratedPerformances === 1 ? "" : "s"}`;
  const rateLabel = `${actor.totalRatings} rating${actor.totalRatings === 1 ? "" : "s"}`;

  return (
    <li className={styles.row}>
      <span className={styles.rank} data-top={rank <= 3 || undefined}>
        {rank}
      </span>
      <span className={styles.avatar}>
        {img ? (
          <Image
            src={img}
            alt={actor.name}
            fill
            sizes="48px"
            className={styles.cover}
          />
        ) : (
          <span className={styles.initial}>{actor.name.charAt(0)}</span>
        )}
      </span>
      <span className={styles.info}>
        <span className={styles.name}>{actor.name}</span>
        <span className={styles.sub}>
          {perfLabel} · {rateLabel}
        </span>
      </span>
      <span className={styles.score}>
        <span className={styles.scoreNum}>{actor.weighted.toFixed(1)}</span>
        <span className={styles.scoreLabel}>weighted</span>
      </span>
    </li>
  );
}
