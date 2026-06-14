"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MovieHero.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Movie-hero backdrop that drifts slower than the page scroll (parallax).
 * The inner layer is scaled up a touch so the vertical travel never exposes
 * an edge. No-ops under prefers-reduced-motion.
 */
export default function ParallaxBackdrop({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const layer = layerRef.current;
    if (!wrap || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        layer,
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, wrap);

    return () => ctx.revert();
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
