"use client";

import { useEffect, useState } from "react";
import { BEE_PALETTE, BEE_SPRITE } from "./beeSprite";
import { setLiveSprite } from "./liveSprite";
import styles from "./BeeLab.module.scss";

const CANVAS = 18;

// Center the code sprite inside a CANVAS×CANVAS grid as the starting point.
function centerIn(rows: string[], size: number): string[] {
  const w = rows[0]?.length ?? 0;
  const h = rows.length;
  const padL = Math.max(0, Math.floor((size - w) / 2));
  const padR = Math.max(0, size - w - padL);
  const padT = Math.max(0, Math.floor((size - h) / 2));
  const padB = Math.max(0, size - h - padT);
  const blank = ".".repeat(size);
  const mid = rows.map((r) => ".".repeat(padL) + r + ".".repeat(padR));
  return [
    ...Array(padT).fill(blank),
    ...mid,
    ...Array(padB).fill(blank),
  ];
}

const start = () => centerIn(BEE_SPRITE, CANVAS);

export default function BeeLab() {
  const [open, setOpen] = useState(false);
  const [grid, setGrid] = useState<string[]>(start);
  const [palette, setPalette] = useState<string[]>([...BEE_PALETTE]);
  const [past, setPast] = useState<string[][]>([]);
  const [future, setFuture] = useState<string[][]>([]);
  const [paint, setPaint] = useState<string>("1"); // "1".."5" or "."
  const [painting, setPainting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const up = () => setPainting(false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  // live-preview on the real bee; clear override on unmount
  useEffect(() => {
    setLiveSprite(grid, palette);
  }, [grid, palette]);
  useEffect(() => () => setLiveSprite(null), []);

  const cols = grid[0]?.length ?? 0;

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (!mod || (k !== "z" && k !== "y")) return;
      e.preventDefault();
      if (k === "y" || (k === "z" && e.shiftKey)) redo();
      else undo();
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

  const pad = (n: number) => ".".repeat(Math.max(1, n));
  const addTop = () => { snapshot(); setGrid((g) => [pad(cols), ...g]); };
  const addBottom = () => { snapshot(); setGrid((g) => [...g, pad(cols)]); };
  const addLeft = () => { snapshot(); setGrid((g) => g.map((r) => "." + r)); };
  const addRight = () => { snapshot(); setGrid((g) => g.map((r) => r + ".")); };
  const removeTop = () => { snapshot(); setGrid((g) => (g.length > 1 ? g.slice(1) : g)); };
  const removeBottom = () => { snapshot(); setGrid((g) => (g.length > 1 ? g.slice(0, -1) : g)); };
  const removeLeft = () => { snapshot(); setGrid((g) => (cols > 1 ? g.map((r) => r.slice(1)) : g)); };
  const removeRight = () => { snapshot(); setGrid((g) => (cols > 1 ? g.map((r) => r.slice(0, -1)) : g)); };

  const SIDES = [
    { name: "Top", add: addTop, rem: removeTop },
    { name: "Bottom", add: addBottom, rem: removeBottom },
    { name: "Left", add: addLeft, rem: removeLeft },
    { name: "Right", add: addRight, rem: removeRight },
  ];

  function reset() { snapshot(); setGrid(start()); }
  function clear() { snapshot(); setGrid(Array(grid.length).fill(".".repeat(cols))); }

  function fillOf(ch: string) {
    return ch === "." ? "transparent" : palette[Number(ch) - 1] ?? "transparent";
  }

  async function copy() {
    const pal =
      "export const BEE_PALETTE = [\n" +
      palette.map((c) => `  "${c}",`).join("\n") +
      "\n];";
    const spr =
      "export const BEE_SPRITE = [\n" +
      grid.map((r) => `  "${r}",`).join("\n") +
      "\n];";
    try {
      await navigator.clipboard.writeText(`${pal}\n\n${spr}`);
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
        <button type="button" className={styles.x} onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
      </header>

      <div className={styles.palette}>
        {palette.map((col, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.swatch} ${paint === String(i + 1) ? styles.on : ""}`}
            style={{ background: col }}
            onClick={() => setPaint(String(i + 1))}
            title={`Paint color ${i + 1}`}
          />
        ))}
        <button
          type="button"
          className={`${styles.swatch} ${styles.erase} ${paint === "." ? styles.on : ""}`}
          onClick={() => setPaint(".")}
          title="Erase"
        >
          ⌫
        </button>
      </div>

      <div className={styles.pickers}>
        {palette.map((col, i) => (
          <input
            key={i}
            type="color"
            value={col}
            onChange={(e) =>
              setPalette((p) => p.map((c, j) => (j === i ? e.target.value : c)))
            }
            title={`Edit color ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {grid.flatMap((row, r) =>
          [...row].map((ch, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={styles.cell}
              style={{ background: fillOf(ch) }}
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

      <div className={styles.canvasCtl}>
        <span className={styles.dimLabel}>
          Canvas {cols}×{grid.length}
        </span>
        <div className={styles.sides}>
          {SIDES.map((s) => (
            <div key={s.name} className={styles.sideRow}>
              <span>{s.name}</span>
              <button type="button" onClick={s.add} title={`Add space on ${s.name.toLowerCase()}`}>
                ＋
              </button>
              <button type="button" onClick={s.rem} title={`Remove from ${s.name.toLowerCase()}`}>
                −
              </button>
            </div>
          ))}
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
        <button type="button" onClick={clear}>
          Clear
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </footer>
      <p className={styles.hint}>
        Pick a color (edit any swatch with the pickers below it), then click/drag
        on the grid. “Copy sprite” gives you the <code>BEE_PALETTE</code> +{" "}
        <code>BEE_SPRITE</code> to paste into beeSprite.ts.
      </p>
    </aside>
  );
}
