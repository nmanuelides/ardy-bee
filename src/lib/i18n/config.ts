// Cookie-based locale: a header toggle flips the language in place (no URL
// change). The locale cookie is read on the server to pick the dictionary and
// the TMDb `language` param.

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "es";
}

/** TMDb `language` query value for a locale (localizes overviews, genres, …). */
export const TMDB_LANG: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
};
