import MovieCard from "@/components/movie/MovieCard";
import type { TmdbMovie } from "@/lib/tmdb/types";
import styles from "./SectionRail.module.scss";

interface SectionRailProps {
  title: string;
  movies?: TmdbMovie[];
  /** Skeleton cards shown while there is no data (loading / TMDb error). */
  skeletonCount?: number;
}

/** Horizontal, scroll-snapping rail of movie cards. */
export default function SectionRail({
  title,
  movies,
  skeletonCount = 6,
}: SectionRailProps) {
  const list = movies ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.rail}>
        {list.length > 0
          ? list.map((movie) => <MovieCard key={movie.id} movie={movie} />)
          : Array.from({ length: skeletonCount }, (_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
      </div>
    </section>
  );
}
