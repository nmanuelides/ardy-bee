"use client";

import { useEffect, useState } from "react";
import { BEE_SPRITE } from "./beeSprite";
import { setLiveSprite } from "./liveSprite";
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
  const [past, setPast] = useState<string[][]>([]);
  const [future, setFuture] = useState<string[][]>([]);
  const [paint, setPaint] = useState<Char>("A");
  const [painting, setPainting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const up = () => setPainting(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  // push edits to the live bee (logo + cursor) so they update in real time;
  // clear the override on unmount so the code sprite takes over again.
  useEffect(() => {
    setLiveSprite(grid);
  }, [grid]);
  useEffect(() => () => setLiveSprite(null), []);

  const cols = grid[0]?.length ?? 0;

  // snapshot the current grid onto the undo stack (and drop redo history)
  function snapshot() {
    setPast((p) => [...p, grid]);
    setFuture([]);
  }

  function undo() {
    setPast((p) => {
      if (!p.length) return p;
      setFuture((f) => [grid, ...f]);
      setGrid(p[p.length - 1]);
      return p.slice(0, -1);
    });
  }

  function redo() {
    setFuture((f) => {
      if (!f.length) return f;
      setPast((p) => [...p, grid]);
      setGrid(f[0]);
      return f.slice(1);
    });
  }

  // keyboard undo/redo while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.key.toLowerCase() !== "z" && e.key.toLowerCase() !== "y") return;
      e.preventDefault();
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function setCell(r: number, c: number) {
    setGrid((g) =>
      g.map((row, ri) =>
        ri === r ? row.slice(0, c) + paint + row.slice(c + 1) : row,
      ),
    );
  }

  const addRow = () => {
    snapshot();
    setGrid((g) => [...g, ".".repeat(cols || 1)]);
  };
  const removeRow = () => {
    snapshot();
    setGrid((g) => (g.length > 1 ? g.slice(0, -1) : g));
  };
  const addCol = () => {
    snapshot();
    setGrid((g) => g.map((row) => row + "."));
  };
  const removeCol = () => {
    snapshot();
    setGrid((g) => (cols > 1 ? g.map((row) => row.slice(0, -1)) : g));
  };

  function reset() {
    snapshot();
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
                snapshot();
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
        <button type="button" onClick={undo} disabled={!past.length} title="Undo (Ctrl+Z)">
          ↶ Undo
        </button>
        <button type="button" onClick={redo} disabled={!future.length} title="Redo (Ctrl+Shift+Z)">
          ↷ Redo
        </button>
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
