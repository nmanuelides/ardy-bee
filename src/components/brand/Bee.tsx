"use client";

import { useBee } from "./liveSprite";
import styles from "./Bee.module.scss";

/** Static Ardy mascot sprite (used in the logo). */
export default function Bee({ px = 2 }: { px?: number }) {
  const { sprite, palette } = useBee();
  const rects: React.ReactElement[] = [];
  sprite.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      const fill = palette[Number(c) - 1];
      if (!fill) return;
      rects.push(
        <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={fill} />,
      );
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
