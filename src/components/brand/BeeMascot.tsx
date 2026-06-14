"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { DoubleSide } from "three";
import styles from "./BeeMascot.module.scss";

const CREAM = "#edd6ad";
const DARK = "#13121e";
const ACCENT = "#d10076";

function Bee() {
  const leftWing = useRef<Group>(null);
  const rightWing = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flap = Math.sin(t * 28) * 0.6 + 0.5;
    if (leftWing.current) leftWing.current.rotation.z = flap;
    if (rightWing.current) rightWing.current.rotation.z = -flap;
  });

  return (
    <group rotation={[0.15, -0.5, 0.08]} scale={1.1}>
      {/* Body */}
      <mesh scale={[1, 1, 1.35]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>

      {/* Stripes */}
      {[-0.1, 0.45].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.14, 16, 48]} />
          <meshStandardMaterial color={DARK} roughness={0.55} />
        </mesh>
      ))}

      {/* Head */}
      <mesh position={[0, 0.1, 1.15]}>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>

      {/* Eyes */}
      {[-0.26, 0.26].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 1.55]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={CREAM} roughness={0.3} />
        </mesh>
      ))}

      {/* Antennae */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 1.45]} rotation={[0.5, 0, x * 1.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      ))}

      {/* Stinger */}
      <mesh position={[0, 0, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.6, 16]} />
        <meshStandardMaterial color={ACCENT} roughness={0.3} />
      </mesh>

      {/* Wings — each in a group so it pivots from the root */}
      <group ref={leftWing} position={[0, 0.7, 0.1]}>
        <mesh position={[-0.95, 0.1, 0]} scale={[1, 0.45, 0.12]}>
          <sphereGeometry args={[0.95, 20, 20]} />
          <meshStandardMaterial
            color={CREAM}
            transparent
            opacity={0.45}
            roughness={0.1}
            side={DoubleSide}
          />
        </mesh>
      </group>
      <group ref={rightWing} position={[0, 0.7, 0.1]}>
        <mesh position={[0.95, 0.1, 0]} scale={[1, 0.45, 0.12]}>
          <sphereGeometry args={[0.95, 20, 20]} />
          <meshStandardMaterial
            color={CREAM}
            transparent
            opacity={0.45}
            roughness={0.1}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

/** The low-poly Ardy Bee mascot. Rendered client-side only. */
export default function BeeMascot() {
  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color={ACCENT} />
        <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.3}>
          <Bee />
        </Float>
      </Canvas>
    </div>
  );
}
