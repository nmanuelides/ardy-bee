"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/provider";
import styles from "./ThemeToggle.module.scss";

type Theme = "ardy" | "light";

export default function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("ardy");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || "ardy");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "ardy" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }

  const isLight = theme === "light";
  const label = isLight ? t.theme.toDark : t.theme.toLight;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {isLight ? (
        // moon → switch back to dark
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
            fill="currentColor"
          />
        </svg>
      ) : (
        // sun → switch to light
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="5.1" y1="5.1" x2="6.9" y2="6.9" />
            <line x1="17.1" y1="17.1" x2="18.9" y2="18.9" />
            <line x1="5.1" y1="18.9" x2="6.9" y2="17.1" />
            <line x1="17.1" y1="6.9" x2="18.9" y2="5.1" />
          </g>
        </svg>
      )}
    </button>
  );
}
