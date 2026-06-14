"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./MovieHero.module.scss";

const SCALE = 1.7;
const TRAVEL = 32; // % of layer height the image drifts as the banner leaves

/**
 * Movie-hero backdrop that drifts slower than the page scroll (parallax).
 * As the banner scrolls up past the top of the viewport, the image is pushed
 * down so it lags well behind the foreground card/text. The layer is scaled
 * up so the drift never exposes an edge. No-ops under prefers-reduced-motion.
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
      const h = rect.height || 1;
      // q ramps 0 → 1 as the banner scrolls from top-aligned to fully past the
      // top — i.e. exactly while it's visibly leaving. Concentrating the drift
      // here (rather than across the whole on-screen lifetime) is what makes
      // the parallax actually perceptible.
      const q = Math.max(0, Math.min(1, -rect.top / h));
      const y = q * TRAVEL;
      layer.style.transform = `translate3d(0, ${y}%, 0) scale(${SCALE})`;
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
