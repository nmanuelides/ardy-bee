// Server-only TMDb client. Uses the v4 read access token as a Bearer header.
// NEVER import this from a Client Component — it would leak the token.
import "server-only";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Fetch a TMDb endpoint. Responses are cached by Next's data cache
 * (revalidated hourly) to stay well within TMDb rate limits.
 */
export async function tmdbFetch<T>(
  path: string,
  params: QueryParams = {},
): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      accept: "application/json",
    },
    next: { revalidate: 60 * 60 }, // 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDb ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export type PosterSize = "w185" | "w342" | "w500" | "w780" | "original";
export type ProfileSize = "w185" | "w342" | "h632" | "original";

/** Build a full image URL from a TMDb file path, or null if absent. */
export function tmdbImage(
  filePath: string | null | undefined,
  size: PosterSize | ProfileSize = "w500",
): string | null {
  return filePath ? `${IMAGE_BASE}/${size}${filePath}` : null;
}
