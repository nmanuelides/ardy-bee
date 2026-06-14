"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { ShaderMaterial } from "three";
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
  varying vec2 vUv;

  // Soft hexagon (honeycomb cell): rotate by rot for variety, measure the
  // regular-hexagon distance, then a gentle smoothstep so it still blurs
  // cleanly under glass while reading clearly as a hex.
  float blob(vec2 p, vec2 c, float r, float rot) {
    vec2 d = p - c;
    float ca = cos(rot), sa = sin(rot);
    d = vec2(d.x * ca - d.y * sa, d.x * sa + d.y * ca);
    d = abs(d);
    float hd = max(dot(d, vec2(0.8660254, 0.5)), d.y);
    return smoothstep(r, r - 0.05, hd);
  }

  void main() {
    float a = uAspect;
    vec2 p = vec2(vUv.x * a, vUv.y); // aspect-corrected so blobs stay round

    vec3 INK  = vec3(0.0745, 0.0706, 0.1176); // #13121E
    vec3 PLUM = vec3(0.1882, 0.0078, 0.1373); // #300223
    vec3 ACC  = vec3(0.8196, 0.0,    0.4627); // #D10076

    float t = uTime * 0.08;
    vec3 col = INK;

    col = mix(col, PLUM, blob(p, vec2((0.15 + 0.08 * cos(t))       * a, 0.80 + 0.06 * sin(t * 0.9)), 0.30, 1.0) * 0.85);
    col = mix(col, ACC,  blob(p, vec2((0.85 + 0.07 * sin(t * 1.1)) * a, 0.20 + 0.07 * cos(t)),       0.26, 3.4) * 0.60);
    col = mix(col, ACC,  blob(p, vec2((0.70 + 0.10 * sin(t * 0.6)) * a, 0.78 + 0.06 * cos(t * 0.8)), 0.19, 5.1) * 0.45);
    col = mix(col, PLUM, blob(p, vec2((0.42 + 0.10 * cos(t * 0.7)) * a, 0.35 + 0.08 * sin(t * 0.9)), 0.24, 2.2) * 0.55);
    col = mix(col, ACC,  blob(p, vec2((0.30 + 0.08 * sin(t * 0.5)) * a, 0.62 + 0.07 * cos(t * 1.2)), 0.16, 4.0) * 0.40);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Blobs({ animate }: { animate: boolean }) {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAspect: { value: 1 } }),
    [],
  );

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
