"use client";

import { useBeeSprite } from "./liveSprite";
import styles from "./Bee.module.scss";

/** Static Ardy mascot sprite (used in the logo). */
export default function Bee({ px = 2 }: { px?: number }) {
  const sprite = useBeeSprite();
  const rects: React.ReactElement[] = [];
  sprite.forEach((row, y) => {
    [...row].forEach((c, x) => {
      const cls =
        c === "A" ? styles.accent : c === "D" ? styles.dark : c === "C" ? styles.cream : null;
      if (cls) {
        rects.push(
          <rect key={`${x}-${y}`} className={cls} x={x * px} y={y * px} width={px} height={px} />,
        );
      }
    });
  });
  const w = sprite[0].length * px;
  const h = sprite.length * px;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={styles.svg} role="presentation">
      {rects}
    </svg>
  );
}
