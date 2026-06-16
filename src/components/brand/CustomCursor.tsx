"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.scss";

const INTERACTIVE = "a,button,input,textarea,select,label,[role='button'],[data-cursor]";

/**
 * Custom themed cursor: an accent ring (trails slightly) + a cream dot (exact).
 * Uses CSS variables so it follows the active theme. Hides the native cursor on
 * fine-pointer devices; no-ops on touch.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ring = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const center = "translate(-50%, -50%)";
    const move = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) ${center}`;
      }
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(INTERACTIVE);
      setActive(!!el);
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);

    const lerp = reduced ? 1 : 0.22;
    let raf = 0;
    const tick = () => {
      ring.current.x += (target.current.x - ring.current.x) * lerp;
      ring.current.y += (target.current.y - ring.current.y) * lerp;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) ${center}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className={`${styles.ring} ${active ? styles.active : ""} ${down ? styles.down : ""}`}
        aria-hidden="true"
      />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
