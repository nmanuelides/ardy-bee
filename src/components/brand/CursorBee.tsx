"use client";

import { useEffect, useRef, useState } from "react";
import { BEE_EVENT, type BeeReaction, type BeeReactionDetail } from "@/lib/bee/events";
import styles from "./CursorBee.module.scss";

function BeeSvg() {
  return (
    <svg
      width="38"
      height="30"
      viewBox="0 0 40 30"
      className={styles.svg}
      role="presentation"
    >
      <defs>
        <clipPath id="ardy-bee-body">
          <ellipse cx="18" cy="17" rx="12" ry="9" />
        </clipPath>
      </defs>

      {/* wings */}
      <g className={styles.wings}>
        <ellipse cx="15" cy="8" rx="8" ry="4.5" className={styles.wing} />
        <ellipse cx="22" cy="7" rx="6.5" ry="3.8" className={styles.wing} />
      </g>

      {/* stinger (tail, points left/back) */}
      <path d="M6 17 L0 14 L0 20 Z" className={styles.stinger} />

      {/* body */}
      <ellipse cx="18" cy="17" rx="12" ry="9" className={styles.body} />

      {/* stripes, clipped to the body */}
      <g clipPath="url(#ardy-bee-body)">
        <rect x="13" y="6" width="3.2" height="22" className={styles.stripe} />
        <rect x="20" y="6" width="3.2" height="22" className={styles.stripe} />
      </g>

      {/* head */}
      <circle cx="30" cy="16" r="6" className={styles.head} />
      <circle cx="32.5" cy="15" r="1.5" className={styles.eye} />

      {/* antenna */}
      <path d="M31 11 Q33 5 36 5" className={styles.antenna} fill="none" />
      <circle cx="36" cy="5" r="1.3" className={styles.antennaTip} />
    </svg>
  );
}

/** A tiny glowing bee that follows the cursor and reacts to ratings. */
export default function CursorBee() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const facing = useRef(1);
  const mode = useRef<"follow" | "react">("follow");
  const [reaction, setReaction] = useState<BeeReaction | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return; // no cursor companion on touch / reduced-motion
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      if (mode.current === "follow") {
        // hover just up-right of the cursor so it doesn't sit under it
        target.current = { x: e.clientX + 18, y: e.clientY - 18 };
      }
    };

    let revertTimer = 0;
    const onReact = (e: Event) => {
      const { type, x, y } = (e as CustomEvent<BeeReactionDetail>).detail;
      mode.current = "react";
      target.current = { x, y: y - 30 }; // hover just above the target
      setReaction(type);
      window.clearTimeout(revertTimer);
      revertTimer = window.setTimeout(() => {
        mode.current = "follow";
        setReaction(null);
      }, 1500);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener(BEE_EVENT, onReact as EventListener);

    let raf = 0;
    const tick = (now: number) => {
      const wrap = wrapRef.current;
      const flip = flipRef.current;
      if (wrap && flip) {
        const speed = mode.current === "react" ? 0.18 : 0.13;
        const dx = target.current.x - pos.current.x;
        const dy = target.current.y - pos.current.y;
        pos.current.x += dx * speed;
        pos.current.y += dy * speed;
        if (Math.abs(dx) > 1.5) facing.current = dx < 0 ? -1 : 1;
        const bob = Math.sin(now / 220) * 4;
        wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0)`;
        flip.style.transform = `scaleX(${facing.current})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener(BEE_EVENT, onReact as EventListener);
      window.clearTimeout(revertTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className={styles.bee} data-reaction={reaction ?? undefined} aria-hidden="true">
      <div ref={flipRef} className={styles.flip}>
        <div className={styles.react}>
          <BeeSvg />
          <span className={styles.honeyDrop} />
        </div>
      </div>
    </div>
  );
}
