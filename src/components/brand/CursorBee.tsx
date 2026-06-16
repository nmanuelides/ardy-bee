"use client";

import { useEffect, useRef, useState } from "react";
import { BEE_EVENT, type BeeReaction, type BeeReactionDetail } from "@/lib/bee/events";
import { useBee } from "./liveSprite";
import styles from "./CursorBee.module.scss";

const PX = 2;

function BeePixels() {
  const { sprite, palette } = useBee();
  const rects: React.ReactElement[] = [];
  sprite.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      const fill = palette[Number(c) - 1];
      if (!fill) return;
      rects.push(
        <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} fill={fill} />,
      );
    });
  });
  const w = sprite[0].length * PX;
  const h = sprite.length * PX;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={styles.svg} role="presentation">
      {rects}
    </svg>
  );
}

export default function CursorBee() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sparkLayer = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: -200, y: -200 });
  const targetPos = useRef({ x: -200, y: -200 });
  const mode = useRef<"follow" | "react">("follow");
  const reactionRef = useRef<BeeReaction | null>(null);
  const reactCenter = useRef({ x: 0, y: 0 });
  const reactStart = useRef(0);
  const seenMove = useRef(false);
  // 1 = facing left (sprite default), -1 = mirrored to face right
  const facing = useRef(1);

  const [reaction, setReaction] = useState<BeeReaction | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    function spawnSpark(x: number, y: number) {
      const layer = sparkLayer.current;
      if (!layer) return;
      const s = document.createElement("span");
      s.className = styles.spark;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      layer.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 24;
      s.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(0)`,
            opacity: 0,
          },
        ],
        { duration: 420 + Math.random() * 220, easing: "ease-out" },
      ).onfinish = () => s.remove();
    }

    const onMove = (e: MouseEvent) => {
      if (!seenMove.current) {
        seenMove.current = true;
        pos.current = { x: e.clientX + 16, y: e.clientY - 16 };
      }
      if (mode.current === "follow") {
        targetPos.current = { x: e.clientX + 16, y: e.clientY - 16 };
      }
    };

    let revertTimer = 0;
    const stingTimers: number[] = [];
    const onReact = (e: Event) => {
      const { type, x, y } = (e as CustomEvent<BeeReactionDetail>).detail;
      mode.current = "react";
      reactionRef.current = type;
      reactCenter.current = { x, y };
      reactStart.current = performance.now();
      setReaction(type);

      stingTimers.forEach(clearTimeout);
      stingTimers.length = 0;

      if (type === "sting") {
        targetPos.current = { x, y: y - 24 };
        [150, 360, 560].forEach((t) =>
          stingTimers.push(
            window.setTimeout(() => {
              for (let i = 0; i < 6; i++) spawnSpark(x, y);
            }, t),
          ),
        );
      }

      const duration = type === "honey" ? 1700 : 800;
      window.clearTimeout(revertTimer);
      revertTimer = window.setTimeout(() => {
        mode.current = "follow";
        reactionRef.current = null;
        setReaction(null);
      }, duration);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener(BEE_EVENT, onReact as EventListener);

    let raf = 0;
    const tick = (now: number) => {
      const wrap = wrapRef.current;

      if (mode.current === "react" && reactionRef.current === "honey") {
        const t = (now - reactStart.current) / 1000;
        const ang = t * 7;
        const r = 34;
        targetPos.current = {
          x: reactCenter.current.x + Math.cos(ang) * r,
          y: reactCenter.current.y + Math.sin(ang) * r,
        };
        spawnSpark(pos.current.x, pos.current.y);
      }

      if (wrap && seenMove.current) {
        const speed = mode.current === "react" ? 0.2 : 0.13;
        const dx = targetPos.current.x - pos.current.x;
        // face the way he's heading (toward the cursor); hysteresis avoids jitter
        if (dx > 3) facing.current = -1;
        else if (dx < -3) facing.current = 1;
        pos.current.x += dx * speed;
        pos.current.y += (targetPos.current.y - pos.current.y) * speed;
        const bob = Math.sin(now / 220) * 4;
        wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0) scaleX(${facing.current})`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener(BEE_EVENT, onReact as EventListener);
      window.clearTimeout(revertTimer);
      stingTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={sparkLayer} className={styles.sparkLayer} aria-hidden="true" />
      <div
        ref={wrapRef}
        className={styles.bee}
        data-reaction={reaction ?? undefined}
        // start off-screen so it never flashes at (0,0) before the first move
        style={{ transform: "translate3d(-200px, -200px, 0)" }}
        aria-hidden="true"
      >
        <div className={styles.react}>
          <BeePixels />
        </div>
      </div>
    </>
  );
}
