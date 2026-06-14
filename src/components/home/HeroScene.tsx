"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import styles from "./HeroScene.module.scss";

const ACCENT = "#D10076";
const PLUM = "#5e1149";
const CREAM = "#EDD6AD";

// A flower-of-seven honeycomb: a centre cell + six edge-adjacent neighbours.
const R = 1.06;
const CELLS: { pos: [number, number, number]; color: string; em: number }[] = [
  { pos: [0, 0, 0.1], color: ACCENT, em: 0.55 },
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (30 + 60 * i);
    const colors = [PLUM, ACCENT, CREAM, PLUM, ACCENT, CREAM];
    return {
      pos: [Math.cos(a) * R, Math.sin(a) * R, i % 2 ? -0.18 : 0.18] as [
        number,
        number,
        number,
      ],
      color: colors[i],
      em: i === 2 || i === 5 ? 0.25 : 0.4,
    };
  }),
];

function Cluster({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (!animate) {
      g.rotation.set(-0.12, 0.25, 0.08);
      return;
    }
    const t = state.clock.elapsedTime;
    // ease group rotation toward a slow drift + the cursor
    const targetY = Math.sin(t * 0.2) * 0.3 + mouse.current.x * 0.55;
    const targetX = Math.cos(t * 0.17) * 0.15 - mouse.current.y * 0.45;
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.rotation.z = Math.sin(t * 0.12) * 0.08;
    g.position.y = Math.sin(t * 0.6) * 0.07;
  });

  return (
    <group ref={group} rotation={[-0.12, 0.25, 0.08]}>
      {CELLS.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.34, 6]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={c.em}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Floating 3D honeycomb accent for the homepage hero. Decorative (no pointer
 * capture); reacts to the global cursor. Static under reduced motion. */
export default function HeroScene() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={styles.scene} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} color={CREAM} />
        <directionalLight position={[-4, -3, 2]} intensity={0.9} color={ACCENT} />
        <Cluster animate={!reduced} />
      </Canvas>
    </div>
  );
}
