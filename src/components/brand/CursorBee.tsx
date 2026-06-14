"use client";

import { useEffect, useRef, useState } from "react";
import { BEE_EVENT, type BeeReaction, type BeeReactionDetail } from "@/lib/bee/events";
import styles from "./CursorBee.module.scss";

// Front-facing pixel bumblebee.
// 'B' = dark plum (the reference's black), 'Y' = accent (its yellow),
// ' ' = transparent (its white). Wings on top, striped body, stinger below.
const BEE = [
  "...BB....BB...",
  "..B..B..B..B..",
  "..B.BB..BB.B..",
  "...BB....BB...",
  "...BBBBBBBB...",
  "..BYYBYYBYYB..",
  "..BYYBYYBYYB..",
  "..BYYBYYBYYB..",
  "..BYYBYYBYYB..",
  "..BYYBYYBYYB..",
  "...BBBBBBBB...",
  "....BBBBBB....",
  "......BB......",
];
const PX = 3;

function BeePixels() {
  const rects: React.ReactElement[] = [];
  BEE.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === "B" || c === "Y") {
        rects.push(
          <rect
            key={`${x}-${y}`}
            className={c === "Y" ? styles.accent : styles.dark}
            x={x * PX}
            y={y * PX}
            width={PX}
            height={PX}
          />,
        );
      }
    });
  });
  const w = BEE[0].length * PX;
  const h = BEE.length * PX;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={styles.svg} role="presentation">
      {rects}
    </svg>
  );
}

const TRAIL_LEN = 10;
const TRAIL_STEP = 3;

export default function CursorBee() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sparkLayer = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const pos = useRef({ x: -100, y: -100 });
  const targetPos = useRef({ x: -100, y: -100 });
  const mode = useRef<"follow" | "react">("follow");
  const reactionRef = useRef<BeeReaction | null>(null);
  const reactCenter = useRef({ x: 0, y: 0 });
  const reactStart = useRef(0);
  const history = useRef<{ x: number; y: number }[]>([]);

  const [reaction, setReaction] = useState<BeeReaction | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    function spawnSpark(x: number, y: number) {
      const layer = sparkLayer.current;
      if (!layer) return;
      const s = document.createElement("span");
      s.className = styles.spark;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      layer.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 24;
      s.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(0)`,
            opacity: 0,
          },
        ],
        { duration: 420 + Math.random() * 220, easing: "ease-out" },
      ).onfinish = () => s.remove();
    }

    const onMove = (e: MouseEvent) => {
      if (mode.current === "follow") {
        targetPos.current = { x: e.clientX + 16, y: e.clientY - 16 };
      }
    };

    let revertTimer = 0;
    const stingTimers: number[] = [];
    const onReact = (e: Event) => {
      const { type, x, y } = (e as CustomEvent<BeeReactionDetail>).detail;
      mode.current = "react";
      reactionRef.current = type;
      reactCenter.current = { x, y };
      reactStart.current = performance.now();
      setReaction(type);

      stingTimers.forEach(clearTimeout);
      stingTimers.length = 0;

      if (type === "sting") {
        targetPos.current = { x, y: y - 26 }; // hover above; stinger jabs down
        [150, 360, 560].forEach((t) =>
          stingTimers.push(
            window.setTimeout(() => {
              for (let i = 0; i < 6; i++) spawnSpark(x, y);
            }, t),
          ),
        );
      }

      const duration = type === "honey" ? 1700 : 800;
      window.clearTimeout(revertTimer);
      revertTimer = window.setTimeout(() => {
        mode.current = "follow";
        reactionRef.current = null;
        setReaction(null);
      }, duration);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener(BEE_EVENT, onReact as EventListener);

    let raf = 0;
    let frame = 0;
    const tick = (now: number) => {
      frame++;
      const wrap = wrapRef.current;

      if (mode.current === "react" && reactionRef.current === "honey") {
        const t = (now - reactStart.current) / 1000;
        const ang = t * 7;
        const r = 34;
        targetPos.current = {
          x: reactCenter.current.x + Math.cos(ang) * r,
          y: reactCenter.current.y + Math.sin(ang) * r,
        };
        if (frame % 4 === 0) spawnSpark(pos.current.x, pos.current.y);
      }

      if (wrap) {
        const speed = mode.current === "react" ? 0.2 : 0.13;
        pos.current.x += (targetPos.current.x - pos.current.x) * speed;
        pos.current.y += (targetPos.current.y - pos.current.y) * speed;
        const bob = Math.sin(now / 220) * 4;
        wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0)`;
      }

      if (frame % TRAIL_STEP === 0) {
        history.current.unshift({ x: pos.current.x, y: pos.current.y });
        history.current.length = Math.min(history.current.length, TRAIL_LEN);
        for (let i = 0; i < TRAIL_LEN; i++) {
          const dot = trailRefs.current[i];
          const p = history.current[i];
          if (dot && p) dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener(BEE_EVENT, onReact as EventListener);
      window.clearTimeout(revertTimer);
      stingTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className={styles.trailLayer} aria-hidden="true">
        {Array.from({ length: TRAIL_LEN }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
            className={styles.trailDot}
            style={{
              transform: "translate3d(-100px, -100px, 0)",
              opacity: (1 - i / TRAIL_LEN) * 0.6,
              width: `${9 - i * 0.6}px`,
              height: `${9 - i * 0.6}px`,
            }}
          />
        ))}
      </div>

      <div ref={sparkLayer} className={styles.sparkLayer} aria-hidden="true" />

      <div ref={wrapRef} className={styles.bee} data-reaction={reaction ?? undefined} aria-hidden="true">
        <div className={styles.react}>
          <BeePixels />
        </div>
      </div>
    </>
  );
}
