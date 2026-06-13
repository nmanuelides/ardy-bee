import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TmdbMovie } from "@/lib/tmdb/types";
import styles from "./MovieCard.module.scss";

export default function MovieCard({ movie }: { movie: TmdbMovie }) {
  const poster = tmdbImage(movie.poster_path, "w342");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;

  return (
    <Link href={`/movies/${movie.id}`} className={styles.card}>
      <div className={styles.posterWrap}>
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 1024px) 22vw, 15vw"
            className={styles.poster}
          />
        ) : (
          <div className={styles.noPoster}>{movie.title}</div>
        )}
        <span className={styles.cta}>Rate the cast</span>
      </div>
      <div className={styles.meta}>
        <h3 className={styles.title}>{movie.title}</h3>
        {year && <span className={styles.year}>{year}</span>}
      </div>
    </Link>
  );
}
