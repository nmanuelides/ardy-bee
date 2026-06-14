import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TmdbMovieDetails } from "@/lib/tmdb/types";
import styles from "./MovieHero.module.scss";

export default function MovieHero({ details }: { details: TmdbMovieDetails }) {
  const backdrop = tmdbImage(details.backdrop_path, "w780");
  const poster = tmdbImage(details.poster_path, "w342");
  const year = details.release_date ? details.release_date.slice(0, 4) : null;
  const runtime = details.runtime ? `${details.runtime} min` : null;
  const facts = [year, runtime].filter(Boolean).join("  ·  ");

  return (
    <header className={styles.hero}>
      {backdrop && (
        <div className={styles.backdrop}>
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.backdropImg}
          />
        </div>
      )}

      <div className={styles.inner}>
        {poster && (
          <div className={styles.poster}>
            <Image
              src={poster}
              alt={details.title}
              fill
              sizes="(max-width: 768px) 40vw, 360px"
              className={styles.posterImg}
            />
          </div>
        )}

        <div className={styles.meta}>
          <h1 className={styles.title}>{details.title}</h1>
          {facts && <p className={styles.facts}>{facts}</p>}
          {details.tagline && <p className={styles.tagline}>{details.tagline}</p>}
          {details.genres?.length > 0 && (
            <div className={styles.genres}>
              {details.genres.map((g) => (
                <span key={g.id} className={styles.genre}>
                  {g.name}
                </span>
              ))}
            </div>
          )}
          {details.overview && (
            <p className={styles.overview}>{details.overview}</p>
          )}
        </div>
      </div>
    </header>
  );
}
