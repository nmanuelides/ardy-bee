import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import { getT } from "@/lib/i18n/server";
import type { MovieRank } from "@/lib/rankings/queries";
import styles from "./rankings.module.scss";

export default async function MovieRow({
  rank,
  movie,
}: {
  rank: number;
  movie: MovieRank;
}) {
  const t = await getT();
  const img = tmdbImage(movie.posterPath, "w185");
  const rateLabel = `${movie.totalRatings} ${
    movie.totalRatings === 1 ? t.common.rating : t.common.ratings
  }`;

  return (
    <li className={styles.row}>
      <span className={styles.rank} data-top={rank <= 3 || undefined}>
        {rank}
      </span>
      <Link href={`/movies/${movie.movieId}`} className={styles.thumb}>
        {img && (
          <Image
            src={img}
            alt={movie.title}
            fill
            sizes="40px"
            className={styles.cover}
          />
        )}
      </Link>
      <span className={styles.info}>
        <span className={styles.name}>{movie.title}</span>
        <span className={styles.sub}>{rateLabel}</span>
      </span>
      <span className={styles.score}>
        <span className={styles.scoreNum}>{movie.weighted.toFixed(1)}</span>
        <span className={styles.scoreLabel}>{t.rankings.weighted}</span>
      </span>
    </li>
  );
}
