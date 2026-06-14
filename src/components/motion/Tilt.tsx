"use client";

import { useRef, type ReactNode } from "react";
import styles from "./Tilt.module.scss";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
}

/**
 * Wraps content in a pointer-reactive 3D tilt with a cursor-tracked sheen.
 * Real CSS 3D (perspective + rotateX/Y), driven by CSS vars set on pointer
 * move — cheap enough to use on every card. No-ops under reduced motion.
 */
export default function Tilt({ children, className, max = 11 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      className={`${styles.tilt} ${className ?? ""}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div className={styles.inner}>
        {children}
        <span className={styles.glare} aria-hidden />
      </div>
    </div>
  );
}
