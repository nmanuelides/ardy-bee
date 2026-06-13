// Pure TMDb image-URL helpers. No secrets — safe to import anywhere.

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type PosterSize = "w185" | "w342" | "w500" | "w780" | "original";
export type ProfileSize = "w185" | "w342" | "h632" | "original";

/** Build a full image URL from a TMDb file path, or null if absent. */
export function tmdbImage(
  filePath: string | null | undefined,
  size: PosterSize | ProfileSize = "w500",
): string | null {
  return filePath ? `${IMAGE_BASE}/${size}${filePath}` : null;
}
