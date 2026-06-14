"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./MovieHero.module.scss";

const SCALE = 1.22;
const TRAVEL = 14; // % of layer height the image drifts over the hero's scroll

/**
 * Movie-hero backdrop that drifts slower than the page scroll (parallax).
 * Driven directly from scroll position each frame (rAF-throttled) so it
 * doesn't depend on any layout-measurement timing. The layer is scaled up so
 * the drift never exposes an edge. No-ops under prefers-reduced-motion.
 */
export default function ParallaxBackdrop({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      // 0 when the hero sits at the top of the viewport, → 1 as it scrolls
      // fully past the top. Drives the image down as the page scrolls up.
      const p = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
      layer.style.transform = `translate3d(0, ${p * TRAVEL}%, 0) scale(${SCALE})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.backdrop}>
      <div ref={layerRef} className={styles.parallaxLayer}>
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.backdropImg}
        />
      </div>
    </div>
  );
}
