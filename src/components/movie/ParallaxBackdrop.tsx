"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./MovieHero.module.scss";

const SCALE = 1.35; // modest zoom: enough travel for parallax, minimal reframing
const FACTOR = 0.5; // image moves at (1 - FACTOR)x the page → a clear half-speed parallax

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
      const h = wrap.offsetHeight || 1;
      // Drive off the page scroll directly (the banner sits at the top of the
      // page) so the drift starts on the very first pixel of scroll — not only
      // once the banner's top reaches the top of the viewport.
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
      // push the image down at FACTOR× the scroll, so it travels at (1-FACTOR)×
      // the page. Clamp to the scale headroom so an edge never shows.
      const maxTravel = ((SCALE - 1) / 2) * h * 0.95;
      const yPx = Math.min(FACTOR * scrolled, maxTravel);
      layer.style.transform = `translate3d(0, ${(yPx / h) * 100}%, 0) scale(${SCALE})`;
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
