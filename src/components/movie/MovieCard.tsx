import Image from "next/image";
import Link from "next/link";
import Tilt from "@/components/motion/Tilt";
import { tmdbImage } from "@/lib/tmdb/image";
import { formatScore, MIN_RATED_PERFORMANCES } from "@/lib/ratings";
import type { MovieScore } from "@/lib/rankings/queries";
import type { TmdbMovie } from "@/lib/tmdb/types";
import styles from "./MovieCard.module.scss";

export default function MovieCard({
  movie,
  appScore,
}: {
  movie: TmdbMovie;
  /** Ardy's own score for this movie, if enough performances are rated. */
  appScore?: MovieScore | null;
}) {
  const poster = tmdbImage(movie.poster_path, "w342");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  // Show our score only once enough performances in the movie are rated.
  const score =
    appScore && appScore.ratedPerformances >= MIN_RATED_PERFORMANCES
      ? appScore
      : null;

  return (
    <Tilt className={styles.card}>
    <Link href={`/movies/${movie.id}`} className={styles.cardLink}>
      <div className={styles.posterWrap}>
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 1024px) 22vw, 16vw"
            className={styles.poster}
          />
        ) : (
          <div className={styles.noPoster}>{movie.title}</div>
        )}

        {score && (
          <span
            className={styles.score}
            title={`Ardy rating · ${score.ratedPerformances} performances rated`}
          >
            <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
              <path
                d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.7L12 17.5 5.9 20.3l1.4-6.7L2.2 9l6.9-.7z"
                fill="currentColor"
              />
            </svg>
            {formatScore(Number(score.avg.toFixed(1)))}
          </span>
        )}

        <div className={styles.scrim} />
        <div className={styles.info}>
          <h3 className={styles.title}>{movie.title}</h3>
          {year && <span className={styles.year}>{year}</span>}
        </div>

        <span className={styles.cta}>Rate the cast →</span>
      </div>
    </Link>
    </Tilt>
  );
}
