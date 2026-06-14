"use client";

import { useRef, type ReactNode } from "react";
import styles from "./MagneticButton.module.scss";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * A pointer-reactive button: it leans toward the cursor (magnetic), an accent
 * glow follows the pointer, and a honeycomb mesh lights up where you hover.
 * All driven by CSS custom properties set on pointer move (cheap, no re-render).
 */
export default function MagneticButton({ children, onClick, disabled }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    // pointer position (for the glow + honeycomb mask)
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    // magnetic pull: lean a few px toward the cursor from center
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
    <button
      ref={ref}
      type="button"
      className={styles.btn}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.mesh} aria-hidden />
      <span className={styles.glow} aria-hidden />
      <span className={styles.label}>{children}</span>
    </button>
  );
}
