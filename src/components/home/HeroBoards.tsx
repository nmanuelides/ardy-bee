import Link from "next/link";
import type { ActorRank, MovieRank } from "@/lib/rankings/queries";
import styles from "./HeroBoards.module.scss";

interface Row {
  rank: number;
  href: string;
  name: string;
  score: number;
}

function Board({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className={styles.board}>
      <h2 className={styles.boardTitle}>{title}</h2>
      {rows.length > 0 ? (
        <ol className={styles.list}>
          {rows.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className={styles.row}>
                <span className={styles.rank} data-top={r.rank <= 3 || undefined}>
                  {r.rank}
                </span>
                <span className={styles.name}>{r.name}</span>
                <span className={styles.score}>{r.score.toFixed(1)}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.none}>Nothing rated yet</p>
      )}
    </div>
  );
}

export default function HeroBoards({
  actors,
  movies,
}: {
  actors: ActorRank[];
  movies: MovieRank[];
}) {
  const hasData = actors.length > 0 || movies.length > 0;

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.dot} />
        The leaderboard
      </div>

      {hasData ? (
        <div className={styles.boards}>
          <Board
            title="Top actors"
            rows={actors.slice(0, 5).map((a, i) => ({
              rank: i + 1,
              href: `/actors/${a.personId}`,
              name: a.name,
              score: a.weighted,
            }))}
          />
          <Board
            title="Top movies"
            rows={movies.slice(0, 5).map((m, i) => ({
              rank: i + 1,
              href: `/movies/${m.movieId}`,
              name: m.title,
              score: m.weighted,
            }))}
          />
        </div>
      ) : (
        <p className={styles.empty}>
          No performances rated yet — be the first to put an actor on the board.
        </p>
      )}
    </aside>
  );
}
