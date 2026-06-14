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
  varying vec2 vUv;

  // crisp filled circle — only a ~2% anti-aliased band at the rim, so glass
  // on top produces an obvious blurred-vs-sharp contrast as the edges drift
  float blob(vec2 uv, vec2 c, float r) {
    float d = distance(uv, c);
    return smoothstep(r, r - 0.02, d);
  }

  void main() {
    vec2 uv = vUv;
    vec3 INK   = vec3(0.0745, 0.0706, 0.1176); // #13121E
    vec3 PLUM  = vec3(0.1882, 0.0078, 0.1373); // #300223
    vec3 ACC   = vec3(0.8196, 0.0,    0.4627); // #D10076
    vec3 CREAM = vec3(0.9294, 0.8392, 0.6784); // #EDD6AD

    float t = uTime * 0.08;
    vec3 col = INK;

    col = mix(col, PLUM,  blob(uv, vec2(0.15 + 0.08 * cos(t),       0.80 + 0.06 * sin(t * 0.9)), 0.34) * 0.85);
    col = mix(col, ACC,   blob(uv, vec2(0.85 + 0.07 * sin(t * 1.1), 0.20 + 0.07 * cos(t)),       0.30) * 0.60);
    col = mix(col, ACC,   blob(uv, vec2(0.70 + 0.10 * sin(t * 0.6), 0.78 + 0.06 * cos(t * 0.8)), 0.22) * 0.45);
    col = mix(col, PLUM,  blob(uv, vec2(0.45 + 0.10 * cos(t * 0.7), 0.35 + 0.08 * sin(t * 0.9)), 0.26) * 0.55);
    col = mix(col, ACC,   blob(uv, vec2(0.30 + 0.08 * sin(t * 0.5), 0.62 + 0.07 * cos(t * 1.2)), 0.18) * 0.4);
    col = mix(col, CREAM, blob(uv, vec2(0.12 + 0.06 * sin(t * 1.2), 0.25),                       0.14) * 0.08);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Blobs({ animate }: { animate: boolean }) {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (animate && matRef.current) {
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
