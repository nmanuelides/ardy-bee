"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.scss";

const INTERACTIVE = "a,button,input,textarea,select,label,[role='button'],[data-cursor]";

/**
 * Custom themed cursor: a rounded triangle with a yellow→orange gradient and a
 * subtle glow. Follows the pointer exactly (tip = hotspot), swells over
 * interactive elements, squishes on click. Fine-pointer only.
 */
export default function CustomCursor() {
  const elRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      const el = elRef.current;
      if (el) el.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
    };
    const over = (e: PointerEvent) =>
      setActive(!!(e.target as HTMLElement)?.closest?.(INTERACTIVE));
    const dn = () => setDown(true);
    const up = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={elRef}
      className={`${styles.cursor} ${active ? styles.active : ""} ${down ? styles.down : ""}`}
      aria-hidden="true"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" className={styles.tri}>
        <defs>
          <linearGradient id="ardyCursorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#ff7a00" />
          </linearGradient>
        </defs>
        <polygon
          points="3,3 20,13 13,20"
          fill="url(#ardyCursorGrad)"
          stroke="url(#ardyCursorGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
