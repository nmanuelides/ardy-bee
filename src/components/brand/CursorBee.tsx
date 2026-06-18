"use client";

import { useEffect, useRef, useState } from "react";
import { BEE_EVENT, type BeeReaction, type BeeReactionDetail } from "@/lib/bee/events";
import { useBee } from "./liveSprite";
import { BEE_STING_SPRITE } from "./beeSprite";
import styles from "./CursorBee.module.scss";

const PX = 2;
const STING_DURATION = 1100; // ms: enough for 4 down-jabs + settle

// Honeycomb lattice (pointy-top). The trail snaps cells to this fixed grid so
// consecutive cells share edges and read as one continuous honeycomb.
const TRAIL_R = 6; // hex radius (small)
const HEX_W = Math.sqrt(3) * TRAIL_R; // column pitch
const HEX_V = 1.5 * TRAIL_R; // row pitch

function snapCell(px: number, py: number) {
  const r = Math.round(py / HEX_V);
  const rr = ((r % 2) + 2) % 2; // 0/1, handles negatives
  const q = Math.round(px / HEX_W - 0.5 * rr);
  return { q, r, cx: HEX_W * (q + 0.5 * rr), cy: HEX_V * r };
}

function strokeHex(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (60 * k - 90);
    const x = cx + TRAIL_R * Math.cos(a);
    const y = cy + TRAIL_R * Math.sin(a);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function BeePixels({ sprite: override }: { sprite?: string[] }) {
  const { sprite: live, palette } = useBee();
  const sprite = override ?? live;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const vp = useRef({ w: 0, h: 0 });
  const accentRef = useRef("#ff9500");
  const lastCellKey = useRef("");
  // live honeycomb cells (cleared + redrawn each frame so nothing lingers)
  const cells = useRef<{ cx: number; cy: number; born: number }[]>([]);
  // whether the canvas had anything painted last frame (so we clear once more
  // when the trail empties, then leave the idle canvas untouched)
  const hadCells = useRef(false);

  const pos = useRef({ x: -200, y: -200 });
  const targetPos = useRef({ x: -200, y: -200 });
  const mode = useRef<"follow" | "react">("follow");
  const reactionRef = useRef<BeeReaction | null>(null);
  const reactCenter = useRef({ x: 0, y: 0 });
  const reactStart = useRef(0);
  const seenMove = useRef(false);
  // raw cursor position (Ardy faces toward it)
  const cursor = useRef({ x: -200, y: -200 });
  // scaleX applied to the sprite: 1 = as drawn (faces right), -1 = faces left
  const facing = useRef(-1);

  const [reaction, setReaction] = useState<BeeReaction | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Canvas setup for the honeycomb trail (one element; cheap to draw on).
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctxRef.current = ctx;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      vp.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const readAccent = () => {
      accentRef.current =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-accent")
          .trim() || "#ff9500";
    };
    readAccent();
    const obs = new MutationObserver(readAccent);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });
    window.addEventListener("resize", resize);
    window.addEventListener("ardy-theme-colors", readAccent);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("ardy-theme-colors", readAccent);
      obs.disconnect();
      ctxRef.current = null;
    };
  }, [enabled]);

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
      cursor.current = { x: e.clientX, y: e.clientY };
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
      // Events give the avatar's centre; pos is the sprite's top-left, so shift
      // by ~half the 38px sprite to centre her body (and the honey orbit) on it.
      reactCenter.current = { x: x - 19, y: y - 19 };
      reactStart.current = performance.now();
      setReaction(type);

      stingTimers.forEach(clearTimeout);
      stingTimers.length = 0;

      if (type === "sting") {
        // hover centred just above the avatar so the down-pointing stinger lands on it
        targetPos.current = { x: x - 19, y: y - 40 };
        // a spark burst on each of the 4 downward jabs
        [300, 500, 700, 900].forEach((t) =>
          stingTimers.push(
            window.setTimeout(() => {
              for (let i = 0; i < 6; i++) spawnSpark(x, y);
            }, t),
          ),
        );
      }

      const duration = type === "honey" ? 1700 : STING_DURATION;
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

      // clear + redraw only the still-alive honeycomb cells (no lingering marks).
      // When the trail is empty we skip the full-viewport clearRect entirely —
      // that's the common (idle) case, and clearing a screen-sized canvas 60x/s
      // for nothing was the bulk of this loop's cost.
      const ctx = ctxRef.current;
      const arr = cells.current;
      if (ctx && (arr.length > 0 || hadCells.current)) {
        ctx.clearRect(0, 0, vp.current.w, vp.current.h);
        const LIFE = 450; // ms a cell takes to fade out
        ctx.strokeStyle = accentRef.current;
        let w = 0;
        for (let i = 0; i < arr.length; i++) {
          const c = arr[i];
          const age = now - c.born;
          if (age >= LIFE) continue; // expired → dropped
          const a = 1 - age / LIFE;
          ctx.globalAlpha = a * 0.3; // soft outer glow
          ctx.lineWidth = 3.5;
          strokeHex(ctx, c.cx, c.cy);
          ctx.globalAlpha = a; // crisp edge
          ctx.lineWidth = 1.3;
          strokeHex(ctx, c.cx, c.cy);
          arr[w++] = c; // keep survivor
        }
        arr.length = w;
        ctx.globalAlpha = 1;
        hadCells.current = w > 0;
      }

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
        const stinging = mode.current === "react" && reactionRef.current === "sting";
        // snap up to the avatar fast so she stings from above, not mid-flight
        const speed = stinging ? 0.32 : mode.current === "react" ? 0.2 : 0.13;
        const dx = targetPos.current.x - pos.current.x;
        // always look toward the actual cursor; hysteresis avoids jitter when
        // she's roughly level with it horizontally
        const toCursor = cursor.current.x - pos.current.x;
        if (toCursor > 4) facing.current = 1; // cursor to the right → face right
        else if (toCursor < -4) facing.current = -1; // cursor left → face left
        pos.current.x += dx * speed;
        pos.current.y += (targetPos.current.y - pos.current.y) * speed;
        const bob = Math.sin(now / 220) * 4;

        if (stinging) {
          // Rotate so her stinger (sideways at rest) points straight down, then
          // thrust down→up 4× in screen space (decaying). Done here, not in CSS,
          // because the wrapper's scaleX would mirror a CSS rotation. rotate is
          // innermost so she spins in place; the translateY before it stays
          // screen-vertical, so stabs go down. The `near` gate suppresses the
          // stab until she's parked above the avatar, so she never stings the
          // side mid-flight.
          const dist = Math.hypot(
            targetPos.current.x - pos.current.x,
            targetPos.current.y - pos.current.y,
          );
          const near = Math.max(0, Math.min(1, 1 - dist / 60));
          const p = Math.min(1, (now - reactStart.current) / STING_DURATION);
          // 4 equal up/down jabs (no decay): -sin gives full cycles that start
          // and end at rest, so every stab is the same size.
          const stab = -Math.sin(p * Math.PI * 8) * 15 * near;
          const lunge = stab * 0.4; // rock in sync with each jab
          wrap.style.transform =
            `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0) ` +
            `translateY(${stab}px) rotate(${-90 + lunge}deg)`;
        } else {
          wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y + bob}px, 0) scaleX(${facing.current})`;
        }

        // leave honeycomb behind Ardy: from her body center, offset to her rear
        // (opposite the way she faces). facing 1 = faces right → rear is left.
        {
          const bx = pos.current.x + 19 - facing.current * 16; // sprite ~38px
          const by = pos.current.y + 19;
          const cell = snapCell(bx, by);
          const key = `${cell.q}:${cell.r}`;
          if (key !== lastCellKey.current) {
            lastCellKey.current = key;
            arr.push({ cx: cell.cx, cy: cell.cy, born: now });
            // a second row below → a 2-row honeycomb band
            const r2 = cell.r + 1;
            const rr2 = ((r2 % 2) + 2) % 2;
            arr.push({ cx: HEX_W * (cell.q + 0.5 * rr2), cy: HEX_V * r2, born: now });
            if (arr.length > 200) arr.splice(0, arr.length - 200);
          }
        }
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
      <canvas ref={canvasRef} className={styles.trailCanvas} aria-hidden="true" />
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
          <BeePixels sprite={reaction === "sting" ? BEE_STING_SPRITE : undefined} />
        </div>
      </div>
    </>
  );
}
