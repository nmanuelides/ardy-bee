import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { es } from "./es";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
