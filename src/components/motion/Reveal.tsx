"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  /** Animate direct children with a stagger instead of the block as one. */
  stagger?: boolean;
  delay?: number;
  className?: string;
}

/**
 * Fades + slides its content up as it scrolls into view (once).
 * No-ops under prefers-reduced-motion. Content is visible by default, so it
 * degrades gracefully without JS.
 */
export default function Reveal({
  children,
  stagger = false,
  delay = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(stagger ? Array.from(el.children) : el, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
