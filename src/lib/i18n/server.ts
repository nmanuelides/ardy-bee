import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, TMDB_LANG } from "./config";
import type { Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

/** Active locale from the cookie (defaults to English). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Translation dictionary for the active locale — use in Server Components. */
export async function getT(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

/** TMDb `language` value for the active locale (localized overviews/genres). */
export async function getTmdbLang(): Promise<string> {
  return TMDB_LANG[await getLocale()];
}
