"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  formatScore,
  isStinger,
  MAX_RATING,
  ratingLabel,
} from "@/lib/ratings";
import { ratePerformance, removeRating } from "@/lib/ratings/actions";
import { emitBeeReaction } from "@/lib/bee/events";
import styles from "./RatingDial.module.scss";

interface RatingDialProps {
  movieId: number;
  personId: number;
  characterName: string | null;
  creditOrder: number | null;
  initialScore: number | null;
  isAuthenticated: boolean;
}

const CELLS = Array.from({ length: MAX_RATING }, (_, i) => i + 1); // 1..10

// Upload "comet": a dense trail of dots riding the track border via offset-path.
// Round dots (vs one rigid streak) trace the rounded corners cleanly, and
// packing them tightly so they overlap makes the trail read as one continuous
// streak rather than separate dots. Negative staggered delays form a head→tail
// gradient trail. (COMET_DOTS - 1) * COMET_STEP / duration ≈ trail length.
const COMET_DOTS = 40;
const COMET_STEP = 0.006; // seconds between consecutive dots (small → overlap)

export default function RatingDial({
  movieId,
  personId,
  characterName,
  creditOrder,
  initialScore,
  isAuthenticated,
}: RatingDialProps) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(initialScore);
  const [hover, setHover] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scoreRef = useRef<HTMLSpanElement>(null);

  const display = hover ?? score ?? 0;

  // Summon the cursor bee to the actor's avatar: sting a 1, dance honey on a 9+.
  function reactWithBee(value: number) {
    const card = scoreRef.current?.closest("[data-cast-card]");
    const target = card?.querySelector("[data-bee-target]") ?? scoreRef.current;
    const rect = target?.getBoundingClientRect();
    if (!rect) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (isStinger(value)) emitBeeReaction("sting", x, y);
    else if (value >= 9) emitBeeReaction("honey", x, y);
  }

  // Map pointer position within a cell to a 0.5-resolution value, floored at 1.
  // Typed as MouseEvent so both onPointerMove and onClick handlers can call it.
  function valueFromPointer(cell: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    return Math.max(1, isLeftHalf ? cell - 0.5 : cell);
  }

  function commit(value: number) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setScore(value);
    setError(null);
    reactWithBee(value);

    startTransition(async () => {
      const res = await ratePerformance({
        movieId,
        personId,
        characterName,
        creditOrder,
        score: value,
      });
      if (!res.ok) {
        setError(res.error);
        if (res.needsAuth) router.push("/login");
      }
    });
  }

  function remove() {
    const previous = score;
    setScore(null);
    setHover(null);
    setError(null);

    startTransition(async () => {
      const res = await removeRating({ movieId, personId });
      if (!res.ok) {
        setScore(previous); // roll back the optimistic clear
        setError(res.error);
        if (res.needsAuth) router.push("/login");
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const current = score ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      commit(Math.min(MAX_RATING, Math.max(1, current + 0.5)));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      commit(Math.max(1, current - 0.5));
    }
  }

  return (
    <div className={styles.dial} data-pending={isPending || undefined}>
      <div
        className={styles.track}
        role="slider"
        tabIndex={0}
        aria-label="Rate this performance from 1 to 10"
        aria-valuemin={1}
        aria-valuemax={MAX_RATING}
        aria-valuenow={score ?? undefined}
        onKeyDown={onKeyDown}
        onPointerLeave={() => setHover(null)}
      >
        {CELLS.map((cell) => {
          const fill = Math.min(1, Math.max(0, display - (cell - 1)));
          return (
            <button
              key={cell}
              type="button"
              className={styles.cell}
              onPointerMove={(e) => setHover(valueFromPointer(cell, e))}
              onClick={(e) => commit(valueFromPointer(cell, e))}
              aria-label={`${cell} out of ${MAX_RATING}`}
            >
              <span
                className={styles.cellFill}
                style={{ transform: `scaleX(${fill})` }}
              />
            </button>
          );
        })}

        {isPending && (
          <span className={styles.comet} aria-hidden="true">
            {Array.from({ length: COMET_DOTS }, (_, i) => {
              // headness: 0 at the trailing dot → 1 at the leading (most ahead).
              const headness = i / (COMET_DOTS - 1);
              return (
                <span
                  key={i}
                  className={styles.dot}
                  style={{
                    animationDelay: `${(-(i * COMET_STEP)).toFixed(3)}s`,
                    background: `color-mix(in srgb, var(--color-surface-2) ${Math.round(
                      (1 - headness) * 100,
                    )}%, var(--color-accent))`,
                    opacity: 0.1 + headness * 0.9,
                  }}
                />
              );
            })}
          </span>
        )}
      </div>

      <div className={styles.readout}>
        <span
          ref={scoreRef}
          className={styles.score}
          data-sting={(score !== null && isStinger(score)) || undefined}
          data-honey={(score !== null && score >= 9) || undefined}
        >
          {display > 0 ? formatScore(display) : "–"}
        </span>
        <span className={styles.label}>
          {display > 0 ? ratingLabel(display) : "Rate"}
        </span>
        {score !== null && (
          <button
            type="button"
            className={styles.remove}
            onClick={remove}
            disabled={isPending}
            aria-label="Remove your rating"
          >
            Remove
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
