"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import styles from "./LanguageToggle.module.scss";

// Flips the locale cookie and refreshes: server components re-render with the
// new dictionary/TMDb language, and the I18nProvider (seeded by the root
// layout) hands the new dict to client components.
export default function LanguageToggle() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = locale === "es" ? "en" : "es";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      disabled={isPending}
      aria-label={t.language.switchAria}
      title={t.language.switchAria}
    >
      {t.language.label}
    </button>
  );
}
