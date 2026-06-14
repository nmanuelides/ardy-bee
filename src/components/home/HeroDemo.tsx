"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb/image";
import {
  formatScore,
  isStinger,
  MAX_RATING,
  ratingLabel,
} from "@/lib/ratings";
import { emitBeeReaction } from "@/lib/bee/events";
import styles from "./HeroDemo.module.scss";

export interface Featured {
  movieId: number;
  movieTitle: string;
  year: string | null;
  personId: number;
  actorName: string;
  character: string;
  profilePath: string | null;
}

const CELLS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

/** Live, interactive demo: actually rate a real performance (no save). */
export default function HeroDemo({ featured }: { featured: Featured }) {
  const [score, setScore] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  const display = hover ?? score ?? 0;
  const img = tmdbImage(featured.profilePath, "h632");

  function valueFromPointer(cell: number, e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(1, e.clientX - r.left < r.width / 2 ? cell - 0.5 : cell);
  }

  function set(v: number) {
    setScore(v);
    const rect = scoreRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (isStinger(v)) emitBeeReaction("sting", x, y);
      else if (v >= 9) emitBeeReaction("honey", x, y);
    }
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <span className={styles.dot} />
        Try it — rate this performance
      </div>

      <div className={styles.perf}>
        <span className={styles.avatar}>
          {img ? (
            <Image
              src={img}
              alt={featured.actorName}
              fill
              sizes="56px"
              className={styles.avatarImg}
            />
          ) : (
            <span className={styles.initial}>{featured.actorName.charAt(0)}</span>
          )}
        </span>
        <div className={styles.who}>
          <p className={styles.name}>{featured.actorName}</p>
          <p className={styles.role}>
            {featured.character ? `as ${featured.character} · ` : ""}
            {featured.movieTitle}
            {featured.year ? ` (${featured.year})` : ""}
          </p>
        </div>
        <div className={styles.scoreBlock}>
          <span
            ref={scoreRef}
            className={styles.score}
            data-sting={(score !== null && isStinger(score)) || undefined}
          >
            {display > 0 ? formatScore(display) : "–"}
          </span>
          <span className={styles.label}>
            {display > 0 ? ratingLabel(display) : "Your call"}
          </span>
        </div>
      </div>

      <div
        className={styles.track}
        role="slider"
        tabIndex={0}
        aria-label={`Rate ${featured.actorName} from 1 to 10`}
        aria-valuemin={1}
        aria-valuemax={MAX_RATING}
        aria-valuenow={score ?? undefined}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          const c = score ?? 0;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            set(Math.min(MAX_RATING, Math.max(1, c + 0.5)));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            set(Math.max(1, c - 0.5));
          }
        }}
      >
        {CELLS.map((cell) => {
          const fill = Math.min(1, Math.max(0, display - (cell - 1)));
          return (
            <button
              key={cell}
              type="button"
              className={styles.cell}
              onPointerMove={(e) => setHover(valueFromPointer(cell, e))}
              onClick={(e) => set(valueFromPointer(cell, e))}
              aria-label={`${cell} out of ${MAX_RATING}`}
            >
              <span className={styles.cellFill} style={{ transform: `scaleX(${fill})` }} />
            </button>
          );
        })}
      </div>

      <p className={styles.hint}>
        {score !== null ? (
          <>
            You scored it <strong>{formatScore(score)}</strong>.{" "}
            <Link href={`/movies/${featured.movieId}`} className={styles.link}>
              Rate the whole cast →
            </Link>
          </>
        ) : (
          <>Drag across the bar — watch Ardy react to a 1 or a 9+.</>
        )}
      </p>
    </aside>
  );
}
