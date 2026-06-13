import CastMember, { type PerformanceStat } from "./CastMember";
import type { TmdbCastMember } from "@/lib/tmdb/types";
import styles from "./CastList.module.scss";

interface CastListProps {
  movieId: number;
  cast: TmdbCastMember[];
  stats: Record<number, PerformanceStat>;
  isAuthenticated: boolean;
}

const EMPTY: PerformanceStat = { avg: null, count: 0, myScore: null };

export default function CastList({
  movieId,
  cast,
  stats,
  isAuthenticated,
}: CastListProps) {
  return (
    <div className={styles.grid}>
      {cast.map((member) => (
        <CastMember
          key={member.id}
          movieId={movieId}
          member={member}
          stat={stats[member.id] ?? EMPTY}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
