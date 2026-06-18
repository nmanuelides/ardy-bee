import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb/image";
import RatingDial from "@/components/rating/RatingDial";
import type { TmdbCastMember } from "@/lib/tmdb/types";
import styles from "./CastMember.module.scss";

export interface PerformanceStat {
  avg: number | null;
  count: number;
  myScore: number | null;
}

interface CastMemberProps {
  movieId: number;
  member: TmdbCastMember;
  stat: PerformanceStat;
  isAuthenticated: boolean;
}

export default function CastMember({
  movieId,
  member,
  stat,
  isAuthenticated,
}: CastMemberProps) {
  const profile = tmdbImage(member.profile_path, "w185");

  return (
    <article className={styles.card} data-cast-card>
      <div className={styles.head}>
        <div className={styles.avatar} data-bee-target>
          {profile ? (
            <Image
              src={profile}
              alt={member.name}
              fill
              sizes="64px"
              className={styles.img}
            />
          ) : (
            <span className={styles.initial}>{member.name.charAt(0)}</span>
          )}
        </div>
        <div className={styles.who}>
          <h3 className={styles.name}>{member.name}</h3>
          {member.character && (
            <p className={styles.character}>as {member.character}</p>
          )}
          {stat.count > 0 && stat.avg != null && (
            <p className={styles.community}>
              <span className={styles.communityScore}>
                {stat.avg.toFixed(1)}
              </span>
              {` · ${stat.count} ${stat.count === 1 ? "rating" : "ratings"}`}
            </p>
          )}
        </div>
      </div>

      <RatingDial
        movieId={movieId}
        personId={member.id}
        characterName={member.character || null}
        creditOrder={member.order}
        initialScore={stat.myScore}
        isAuthenticated={isAuthenticated}
      />
    </article>
  );
}
