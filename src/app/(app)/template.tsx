"use client";

import { useState } from "react";
import styles from "./template.module.scss";

// Re-mounts on every navigation → fade + rise entrance. Once the animation
// finishes we drop the class so NO transform lingers — a lingering transform
// would create a containing block that disables backdrop-filter on the glass
// inside the page.
export default function Template({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  return (
    <div
      className={done ? undefined : styles.page}
      onAnimationEnd={() => setDone(true)}
    >
      {children}
    </div>
  );
}
