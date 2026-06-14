"use client";

import { useRef, type ReactNode } from "react";
import Button from "./Button";
import styles from "./MagneticButton.module.scss";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * The standard ghost Button at rest — identical look — that becomes
 * pointer-reactive on hover: it leans toward the cursor (magnetic), an accent
 * glow follows the pointer, and a honeycomb mesh lights up where you hover.
 * Effects are overlays, so the resting button is untouched.
 */
export default function MagneticButton({ children, onClick, disabled }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: React.PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--tx", `${(x / r.width - 0.5) * 12}px`);
    el.style.setProperty("--ty", `${(y / r.height - 0.5) * 10}px`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }

  return (
    <span
      ref={ref}
      className={styles.wrap}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <Button variant="ghost" onClick={onClick} disabled={disabled}>
        {children}
      </Button>
      <span className={styles.fx} aria-hidden>
        <span className={styles.glow} />
        <span className={styles.mesh} />
      </span>
    </span>
  );
}
