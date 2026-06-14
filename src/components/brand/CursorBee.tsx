"use client";

import { useEffect, useRef, useState } from "react";
import { BEE_EVENT, type BeeReaction, type BeeReactionDetail } from "@/lib/bee/events";
import styles from "./CursorBee.module.scss";

// Pixel-art bee sprite, facing right. '#' = accent pixel, ' ' = transparent.
const SPRITE = [
  "   ###    # ",
  "   ####  ## ",
  "  ##### ### ",
  "#### ## ####",
  "#### ## # ##",
  " ### ###### ",
  "  #######   ",
  "   #####    ",
  "    ###     ",
];
const PX = 3;

function BeePixels() {
  const rects: React.ReactElement[] = [];
  SPRITE.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === "#") {
        rects.push(
          <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} />,
        );
      }
    });
  });
  return (
    <svg
      width={SPRITE[0].length * PX}
      height={SPRITE.length * PX}
      viewBox={`0 0 ${SPRITE[0].length * PX} ${SPRITE.length * PX}`}
      className={styles.svg}
      role="presentation"
    >
      <g className={styles.pixels}>{rects}</g>
    </svg>
  );
}

const TRAIL_LEN = 8;

export default function CursorBee() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const sparkLayer = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const facing = useRef(1);
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

    function spawnSpark(x: number, y: number, gold: boolean) {
      const layer = sparkLayer.current;
      if (!layer) return;
      const s = document.createElement("span");
      s.className = gold ? `${styles.spark} ${styles.gold}` : styles.spark;
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

    function burst(x: number, y: number, n: number, gold: boolean) {
      for (let i = 0; i < n; i++) spawnSpark(x, y, gold);
    }

    const onMove = (e: MouseEvent) => {
      if (mode.current === "follow") {
        target.current = { x: e.clientX + 16, y: e.clientY - 16 };
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
        target.current = { x, y: y - 22 }; // hover just above to stab down
        // spark bursts timed with the downstrokes of the stab animation
        [130, 380, 600].forEach((t) =>
          stingTimers.push(window.setTimeout(() => burst(x, y, 6, false), t)),
        );
      }

      const duration = type === "honey" ? 1700 : 750;
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
      const flip = flipRef.current;

      // Honey: orbit around the number, scattering sparks.
      if (mode.current === "react" && reactionRef.current === "honey") {
        const t = (now - reactStart.current) / 1000;
        const ang = t * 7; // ~1 revolution / 0.9s
        const r = 34;
        target.current = {
          x: reactCenter.current.x + Math.cos(ang) * r,
          y: reactCenter.current.y + Math.sin(ang) * r,
        };
        if (frame % 4 === 0) spawnSpark(pos.current.x, pos.current.y, true);
      }

      if (wrap && flip) {
        const speed = mode.current === "react" ? 0.2 : 0.13;
        const dx = target.current.x - pos.current.x;
        const dy = target.current.y - pos.current.y;
        pos.current.x += dx * speed;
        pos.current.y += dy * speed;
        if (Math.abs(dx) > 1.5) facing.current = dx < 0 ? -1 : 1;
        const bob = Math.sin(now / 220) * 4;
        wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0)`;
        flip.style.transform = `scaleX(${facing.current})`;
      }

      // Glow trail — sample every other frame for a longer comet.
      if (frame % 2 === 0) {
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
              opacity: (1 - i / TRAIL_LEN) * 0.45,
              width: `${7 - i * 0.6}px`,
              height: `${7 - i * 0.6}px`,
            }}
          />
        ))}
      </div>

      <div ref={sparkLayer} className={styles.sparkLayer} aria-hidden="true" />

      <div ref={wrapRef} className={styles.bee} data-reaction={reaction ?? undefined} aria-hidden="true">
        <div ref={flipRef} className={styles.flip}>
          <div className={styles.react}>
            <BeePixels />
          </div>
        </div>
      </div>
    </>
  );
}
