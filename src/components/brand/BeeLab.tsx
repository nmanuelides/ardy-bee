"use client";

import { useEffect, useState } from "react";
import { BEE_SPRITE } from "./beeSprite";
import styles from "./BeeLab.module.scss";

type Char = "A" | "D" | "C" | ".";

const SWATCHES: { c: Char; label: string }[] = [
  { c: "A", label: "Accent" },
  { c: "D", label: "Dark" },
  { c: "C", label: "Cream" },
  { c: ".", label: "Erase" },
];

const fill: Record<Char, string> = {
  A: "var(--color-accent)",
  D: "var(--color-surface-2)",
  C: "var(--c-cream)",
  ".": "transparent",
};

export default function BeeLab() {
  const [open, setOpen] = useState(false);
  const [grid, setGrid] = useState<string[]>([...BEE_SPRITE]);
  const [paint, setPaint] = useState<Char>("A");
  const [painting, setPainting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const up = () => setPainting(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const cols = grid[0]?.length ?? 0;

  function setCell(r: number, c: number) {
    setGrid((g) =>
      g.map((row, ri) =>
        ri === r ? row.slice(0, c) + paint + row.slice(c + 1) : row,
      ),
    );
  }

  const addRow = () => setGrid((g) => [...g, ".".repeat(cols || 1)]);
  const removeRow = () => setGrid((g) => (g.length > 1 ? g.slice(0, -1) : g));
  const addCol = () => setGrid((g) => g.map((row) => row + "."));
  const removeCol = () =>
    setGrid((g) => (cols > 1 ? g.map((row) => row.slice(0, -1)) : g));

  function reset() {
    setGrid([...BEE_SPRITE]);
  }

  async function copy() {
    const body = grid.map((row) => `  "${row}",`).join("\n");
    try {
      await navigator.clipboard.writeText(
        `export const BEE_SPRITE = [\n${body}\n];`,
      );
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
        title="Bee editor"
        aria-label="Open bee editor"
      >
        🐝
      </button>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Bee editor">
      <header className={styles.head}>
        <strong>Bee editor</strong>
        <button
          type="button"
          className={styles.x}
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      <div className={styles.palette}>
        {SWATCHES.map((s) => (
          <button
            key={s.c}
            type="button"
            className={`${styles.swatch} ${paint === s.c ? styles.on : ""}`}
            style={{ background: s.c === "." ? undefined : fill[s.c] }}
            onClick={() => setPaint(s.c)}
            title={s.label}
          >
            {s.c === "." ? "⌫" : ""}
          </button>
        ))}
      </div>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {grid.flatMap((row, r) =>
          [...row].map((ch, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={styles.cell}
              style={{ background: fill[(ch as Char) ?? "."] }}
              onPointerDown={() => {
                setPainting(true);
                setCell(r, c);
              }}
              onPointerEnter={() => painting && setCell(r, c)}
              aria-label={`pixel ${r},${c}`}
            />
          )),
        )}
      </div>

      <div className={styles.dims}>
        <span>
          {cols}×{grid.length}
        </span>
        <div className={styles.steppers}>
          <button type="button" onClick={removeCol}>
            −W
          </button>
          <button type="button" onClick={addCol}>
            +W
          </button>
          <button type="button" onClick={removeRow}>
            −H
          </button>
          <button type="button" onClick={addRow}>
            +H
          </button>
        </div>
      </div>

      <footer className={styles.foot}>
        <button type="button" onClick={copy}>
          {copied ? "Copied!" : "Copy sprite"}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </footer>
      <p className={styles.hint}>
        Pick a color, then click/drag on the grid. “Copy sprite” gives you the
        full <code>BEE_SPRITE</code> array to paste into beeSprite.ts.
      </p>
    </aside>
  );
}
