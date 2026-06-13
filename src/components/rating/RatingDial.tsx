"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  formatScore,
  isStinger,
  MAX_RATING,
  ratingLabel,
} from "@/lib/ratings";
import { ratePerformance } from "@/lib/ratings/actions";
import StingBee from "./StingBee";
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
  const [sting, setSting] = useState(0); // increments to retrigger animation
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const stingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const display = hover ?? score ?? 0;

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
    if (isStinger(value)) {
      setSting((n) => n + 1);
      if (stingTimer.current) clearTimeout(stingTimer.current);
    }

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
        <StingBee trigger={sting} />
      </div>

      <div className={styles.readout}>
        <span className={styles.score} data-sting={score !== null && isStinger(score) || undefined}>
          {display > 0 ? formatScore(display) : "–"}
        </span>
        <span className={styles.label}>
          {display > 0 ? ratingLabel(display) : "Rate"}
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
