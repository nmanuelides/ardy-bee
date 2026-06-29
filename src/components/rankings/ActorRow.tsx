import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/image";
import { getT } from "@/lib/i18n/server";
import type { ActorRank } from "@/lib/rankings/queries";
import styles from "./rankings.module.scss";

export default async function ActorRow({
  rank,
  actor,
}: {
  rank: number;
  actor: ActorRank;
}) {
  const t = await getT();
  const img = tmdbImage(actor.profilePath, "w185");
  const perfLabel = `${actor.ratedPerformances} ${
    actor.ratedPerformances === 1 ? t.common.performance : t.common.performances
  }`;
  const rateLabel = `${actor.totalRatings} ${
    actor.totalRatings === 1 ? t.common.rating : t.common.ratings
  }`;

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
        <span className={styles.scoreLabel}>{t.rankings.weighted}</span>
      </span>
    </li>
  );
}
