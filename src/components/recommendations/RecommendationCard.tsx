import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import { getT } from "@/lib/i18n/server";
import type { Recommendation } from "@/lib/recommendations/queries";
import styles from "./RecommendationCard.module.scss";

export default async function RecommendationCard({
  rec,
}: {
  rec: Recommendation;
}) {
  const t = await getT();
  const poster = tmdbImage(rec.posterPath, "w342");
  const names = rec.featuring.map((f) => f.name).join(", ");
  const favLabel =
    rec.featuring.length === 1
      ? t.recommendations.favoriteBadge
      : t.recommendations.favoritesBadge;

  return (
    <Link href={`/movies/${rec.movieId}`} className={styles.card}>
      <div className={styles.posterWrap}>
        {poster ? (
          <Image
            src={poster}
            alt={rec.title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 1024px) 30vw, 22vw"
            className={styles.poster}
          />
        ) : (
          <div className={styles.noPoster}>{rec.title}</div>
        )}
        <span className={styles.badge}>
          {rec.featuring.length} {favLabel}
        </span>
      </div>
      <div className={styles.meta}>
        <h3 className={styles.title}>
          {rec.title}
          {rec.year && <span className={styles.year}> · {rec.year}</span>}
        </h3>
        <p className={styles.featuring}>
          <span className={styles.featLabel}>{t.recommendations.featuring}</span>{" "}
          {names}
        </p>
      </div>
    </Link>
  );
}
