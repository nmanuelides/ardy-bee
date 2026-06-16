"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeLab.module.scss";

// Editable tokens (all are hex literals in the theme files, so they read back
// cleanly into a color input).
const FIELDS: { k: string; label: string }[] = [
  { k: "--c-accent", label: "Accent" },
  { k: "--c-cream", label: "Cream" },
  { k: "--c-plum", label: "Plum" },
  { k: "--c-ink", label: "Ink (dark base)" },
  { k: "--color-surface", label: "Surface" },
  { k: "--color-elevated", label: "Elevated (buttons)" },
  { k: "--bg-blob-base", label: "Background base" },
  { k: "--bg-blob-a", label: "Background blob A" },
  { k: "--bg-blob-b", label: "Background blob B" },
];

function toHex(v: string): string {
  const s = v.trim();
  if (/^#?[0-9a-f]{6}$/i.test(s)) return (s.startsWith("#") ? s : `#${s}`).toLowerCase();
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const [r, g, b] = m[1].split(",").map((x) => parseInt(x, 10));
    return `#${[r, g, b].map((n) => (n || 0).toString(16).padStart(2, "0")).join("")}`;
  }
  return "#000000";
}

export default function ThemeLab() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  function readAll() {
    const s = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.k] = toHex(s.getPropertyValue(f.k));
    setValues(next);
  }

  // refresh values whenever the panel opens
  useEffect(() => {
    if (open) readAll();
  }, [open]);

  function change(k: string, v: string) {
    document.documentElement.style.setProperty(k, v);
    setValues((prev) => ({ ...prev, [k]: v }));
    window.dispatchEvent(new CustomEvent("ardy-theme-colors"));
  }

  function reset() {
    for (const f of FIELDS) document.documentElement.style.removeProperty(f.k);
    window.dispatchEvent(new CustomEvent("ardy-theme-colors"));
    readAll();
  }

  async function copy() {
    const theme = document.documentElement.dataset.theme ?? "ardy";
    const sel = theme === "light" ? `[data-theme="light"]` : `:root, [data-theme="ardy"]`;
    const body = FIELDS.map((f) => `  ${f.k}: ${values[f.k]};`).join("\n");
    try {
      await navigator.clipboard.writeText(`${sel} {\n${body}\n}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen(true)}
        title="Theme lab"
        aria-label="Open theme lab"
      >
        🎨
      </button>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Theme lab">
      <header className={styles.head}>
        <strong>Theme lab</strong>
        <button
          type="button"
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      <div className={styles.rows}>
        {FIELDS.map((f) => (
          <label key={f.k} className={styles.row}>
            <input
              type="color"
              value={values[f.k] ?? "#000000"}
              onChange={(e) => change(f.k, e.target.value)}
            />
            <span className={styles.label}>{f.label}</span>
            <code className={styles.code}>{values[f.k]}</code>
          </label>
        ))}
      </div>

      <footer className={styles.foot}>
        <button type="button" onClick={copy}>
          {copied ? "Copied!" : "Copy tokens"}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </footer>
      <p className={styles.hint}>
        Edits apply live to the current theme. “Copy tokens” gives you a block to
        paste into the theme SCSS. Reset clears the live overrides.
      </p>
    </aside>
  );
}
