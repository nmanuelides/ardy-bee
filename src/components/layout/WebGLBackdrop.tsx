"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3, type ShaderMaterial } from "three";
import styles from "./WebGLBackdrop.module.scss";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uBase; // field base color
  uniform vec3 uColA; // blob color A
  uniform vec3 uColB; // blob color B
  varying vec2 vUv;

  // Soft round-cornered hexagon (honeycomb cell): a true signed-distance
  // hexagon offset outward by a radius, which rounds the vertices so they
  // don't read as sharp points (especially once blurred under glass).
  float blob(vec2 p, vec2 c, float r, float rot) {
    vec2 d = p - c;
    float ca = cos(rot), sa = sin(rot);
    d = vec2(d.x * ca - d.y * sa, d.x * sa + d.y * ca);
    float rad = r * 0.36;            // corner-rounding radius
    float ir = r - rad;              // inner hexagon apothem
    const vec3 k = vec3(-0.8660254, 0.5, 0.5773503);
    d = abs(d);
    d -= 2.0 * min(dot(k.xy, d), 0.0) * k.xy;
    d -= vec2(clamp(d.x, -k.z * ir, k.z * ir), ir);
    float dist = length(d) * sign(d.y) - rad;
    return smoothstep(0.0, -0.05, dist);
  }

  void main() {
    float a = uAspect;
    vec2 p = vec2(vUv.x * a, vUv.y); // aspect-corrected so blobs stay round

    float t = uTime * 0.08;
    vec3 col = uBase;

    col = mix(col, uColA, blob(p, vec2((0.15 + 0.08 * cos(t))       * a, 0.80 + 0.06 * sin(t * 0.9)), 0.30, 1.0) * 0.85);
    col = mix(col, uColB, blob(p, vec2((0.85 + 0.07 * sin(t * 1.1)) * a, 0.20 + 0.07 * cos(t)),       0.26, 3.4) * 0.60);
    col = mix(col, uColB, blob(p, vec2((0.70 + 0.10 * sin(t * 0.6)) * a, 0.78 + 0.06 * cos(t * 0.8)), 0.19, 5.1) * 0.45);
    col = mix(col, uColA, blob(p, vec2((0.42 + 0.10 * cos(t * 0.7)) * a, 0.35 + 0.08 * sin(t * 0.9)), 0.24, 2.2) * 0.55);
    col = mix(col, uColB, blob(p, vec2((0.30 + 0.08 * sin(t * 0.5)) * a, 0.62 + 0.07 * cos(t * 1.2)), 0.16, 4.0) * 0.40);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Per-theme field colors (linear floats, no color management applied).
const PALETTES: Record<string, { base: number[]; a: number[]; b: number[] }> = {
  ardy: {
    base: [0.0745, 0.0706, 0.1176], // ink
    a: [0.1882, 0.0078, 0.1373], // plum
    b: [0.8196, 0.0, 0.4627], // accent
  },
  light: {
    base: [0.929, 0.839, 0.678], // cream
    a: [0.902, 0.741, 0.549], // warm peach
    b: [0.957, 0.71, 0.831], // soft pink
  },
};

function paletteFor(theme: string | undefined) {
  return PALETTES[theme ?? "ardy"] ?? PALETTES.ardy;
}

function Blobs({ animate }: { animate: boolean }) {
  const matRef = useRef<ShaderMaterial>(null);
  const invalidate = useThree((s) => s.invalidate);
  const uniforms = useMemo(() => {
    const p = paletteFor(
      typeof document !== "undefined"
        ? document.documentElement.dataset.theme
        : "ardy",
    );
    return {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uBase: { value: new Vector3(...p.base) },
      uColA: { value: new Vector3(...p.a) },
      uColB: { value: new Vector3(...p.b) },
    };
  }, []);

  // Re-tint when the theme attribute changes (so it works under reduced motion
  // too, where the loop is on-demand — we invalidate to force one render).
  useEffect(() => {
    const apply = () => {
      const m = matRef.current;
      if (!m) return;
      const p = paletteFor(document.documentElement.dataset.theme);
      m.uniforms.uBase.value.set(p.base[0], p.base[1], p.base[2]);
      m.uniforms.uColA.value.set(p.a[0], p.a[1], p.a[2]);
      m.uniforms.uColB.value.set(p.b[0], p.b[1], p.b[2]);
      invalidate();
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, [invalidate]);

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uAspect.value = state.size.width / state.size.height;
    if (animate) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/** Animated WebGL gradient-blob background (frostable by glass surfaces). */
export default function WebGLBackdrop() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={styles.canvas}>
      <Canvas
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
      >
        <Blobs animate={!reduced} />
      </Canvas>
    </div>
  );
}
