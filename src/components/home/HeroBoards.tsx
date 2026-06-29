import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import { getT } from "@/lib/i18n/server";
import type { ActorRank, MovieRank } from "@/lib/rankings/queries";
import styles from "./HeroBoards.module.scss";

interface Row {
  rank: number;
  href: string;
  name: string;
  score: number;
  image: string | null;
  round: boolean;
}

function Board({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: Row[];
  emptyLabel: string;
}) {
  return (
    <div className={styles.board}>
      <h2 className={styles.boardTitle}>{title}</h2>
      {rows.length > 0 ? (
        <ol className={styles.list}>
          {rows.map((r) => {
            const img = tmdbImage(r.image, "w185");
            return (
              <li key={r.href}>
                <Link href={r.href} className={styles.row}>
                  <span className={styles.rank} data-top={r.rank <= 3 || undefined}>
                    {r.rank}
                  </span>
                  <span className={styles.thumb} data-round={r.round || undefined}>
                    {img && (
                      <Image src={img} alt={r.name} fill sizes="32px" className={styles.thumbImg} />
                    )}
                  </span>
                  <span className={styles.name}>{r.name}</span>
                  <span className={styles.score}>{r.score.toFixed(1)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.none}>{emptyLabel}</p>
      )}
    </div>
  );
}

export default async function HeroBoards({
  actors,
  movies,
}: {
  actors: ActorRank[];
  movies: MovieRank[];
}) {
  const t = await getT();
  const hasData = actors.length > 0 || movies.length > 0;

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.dot} />
        {t.leaderboard.title}
      </div>

      {hasData ? (
        <div className={styles.boards}>
          <Board
            title={t.leaderboard.topActors}
            emptyLabel={t.leaderboard.nothingRated}
            rows={actors.slice(0, 5).map((a, i) => ({
              rank: i + 1,
              href: `/actors/${a.personId}`,
              name: a.name,
              score: a.weighted,
              image: a.profilePath,
              round: true,
            }))}
          />
          <Board
            title={t.leaderboard.topMovies}
            emptyLabel={t.leaderboard.nothingRated}
            rows={movies.slice(0, 5).map((m, i) => ({
              rank: i + 1,
              href: `/movies/${m.movieId}`,
              name: m.title,
              score: m.weighted,
              image: m.posterPath,
              round: false,
            }))}
          />
        </div>
      ) : (
        <p className={styles.empty}>{t.leaderboard.empty}</p>
      )}
    </aside>
  );
}
