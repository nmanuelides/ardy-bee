// The Ardy Bee rating scale: 1 to 10 in 0.5 increments (19 possible values).
// A rating of 1 means the performance "stings" 🐝 (our play on "stinks").

export const MIN_RATING = 1;
export const MAX_RATING = 10;
export const RATING_STEP = 0.5;

/** All valid rating values, ascending: [1, 1.5, 2, ... 10]. */
export const RATING_VALUES: number[] = Array.from(
  { length: (MAX_RATING - MIN_RATING) / RATING_STEP + 1 },
  (_, i) => MIN_RATING + i * RATING_STEP,
);

export const STING_THRESHOLD = 1; // a rating of 1 triggers the sting animation

export function isStinger(score: number): boolean {
  return score <= STING_THRESHOLD;
}

/** Short qualitative label for a score, used in UI badges. */
export function ratingLabel(score: number): string {
  if (score <= 1) return "Stings";
  if (score < 3) return "Rough";
  if (score < 5) return "Shaky";
  if (score < 6.5) return "Solid";
  if (score < 8) return "Strong";
  if (score < 9) return "Stellar";
  return "Honey"; // 9.0–10: the sweetest performances
}

/** Format a score for display, e.g. 7 -> "7", 7.5 -> "7.5". */
export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}
