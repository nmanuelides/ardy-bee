"use client";

import { useEffect, useState } from "react";
import styles from "./StingBee.module.scss";

/** Plays the mascot "sting" animation each time `trigger` changes (and is > 0). */
export default function StingBee({ trigger }: { trigger: number }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 1500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!active) return null;

  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg className={styles.bee} viewBox="0 0 64 64" key={trigger}>
        {/* wings */}
        <ellipse cx="26" cy="20" rx="11" ry="7" className={styles.wing} />
        <ellipse cx="38" cy="20" rx="11" ry="7" className={styles.wing} />
        {/* body */}
        <ellipse cx="32" cy="36" rx="15" ry="12" className={styles.body} />
        {/* stripes */}
        <path d="M24 28 Q32 26 40 28" className={styles.stripe} />
        <path d="M21 35 Q32 33 43 35" className={styles.stripe} />
        <path d="M23 42 Q32 41 41 42" className={styles.stripe} />
        {/* stinger */}
        <path d="M32 48 l-3 7 l6 0 z" className={styles.stinger} />
        {/* eyes */}
        <circle cx="28" cy="33" r="1.6" className={styles.eye} />
        <circle cx="36" cy="33" r="1.6" className={styles.eye} />
      </svg>
      <span className={styles.tag}>stings!</span>
    </div>
  );
}
