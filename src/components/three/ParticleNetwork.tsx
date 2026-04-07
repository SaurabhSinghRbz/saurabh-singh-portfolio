"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * ParticleNetwork — subtle 3D node-and-edge network that floats
 * behind the entire site. Nodes glow, edges fade with distance,
 * and the whole system reacts gently to the cursor.
 *
 * Performance: single Points draw call + single LineSegments call.
 * Connection computation runs every 3 frames to save CPU.
 * ------------------------------------------------------------------ */

const DESKTOP_COUNT = 120;
const MOBILE_COUNT = 60;
const CONNECTION_DISTANCE = 2.8;
const CURSOR_INFLUENCE = 3.5;
const CURSOR_STRENGTH = 0.35;
const FIELD_SIZE = 12;

/* Shared pointer state from window listener (canvas is pointer-events: none) */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

/* ---- Node vertex shader ---- */
const nodeVert = /* glsl */ `
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size attenuation + slight pulse
    float pulse = 1.0 + 0.15 * sin(uTime * 1.2 + position.x * 3.0 + position.y * 2.0);
    gl_PointSize = (3.0 * pulse) * (8.0 / -mv.z);
    // Fade at edges
    float edge = 1.0 - smoothstep(4.5, 6.0, length(position.xy));
    vAlpha = edge * (0.5 + 0.3 * pulse);
  }
`;

const nodeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.08, d);
    // Glow halo
    float glow = smoothstep(0.5, 0.0, d) * 0.3;
    gl_FragColor = vec4(uColor, (disc + glow) * vAlpha);
  }
`;

function Network({
  count,
  color,
  lineColor,
}: {
  count: number;
  color: string;
  lineColor: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const { viewport } = useThree();
  const frameCount = useRef(0);

  /* Seed positions + velocities */
  const { positions, velocities, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_SIZE;
      positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.001,
      });
    }
    const uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    };
    return { positions, velocities, uniforms };
  }, [count, color]);

  /* Pre-allocate line buffer (max possible connections) */
  const maxLines = count * 6; // generous upper bound
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineAlphas = useMemo(() => new Float32Array(maxLines * 2), [maxLines]);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    g.setAttribute("alpha", new THREE.BufferAttribute(lineAlphas, 1));
    g.setDrawRange(0, 0);
    return g;
  }, [linePositions, lineAlphas]);

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          attribute float alpha;
          varying float vAlpha;
          void main() {
            vAlpha = alpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uLineColor;
          varying float vAlpha;
          void main() {
            gl_FragColor = vec4(uLineColor, vAlpha);
          }
        `,
        uniforms: {
          uLineColor: { value: new THREE.Color(lineColor) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    [lineColor],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    frameCount.current++;

    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    /* Cursor world position */
    const cx = (pointer.current.x * viewport.width) / 2;
    const cy = (pointer.current.y * viewport.height) / 2;

    /* Update node positions — drift + cursor influence */
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // Drift
      arr[ix] += velocities[i].x;
      arr[iy] += velocities[i].y;
      arr[iz] += velocities[i].z;

      // Wrap at boundaries
      const hs = FIELD_SIZE / 2;
      if (arr[ix] > hs) arr[ix] = -hs;
      if (arr[ix] < -hs) arr[ix] = hs;
      if (arr[iy] > hs) arr[iy] = -hs;
      if (arr[iy] < -hs) arr[iy] = hs;
      if (arr[iz] > 2) arr[iz] = -2;
      if (arr[iz] < -2) arr[iz] = 2;

      // Cursor attraction (gentle)
      const dx = cx - arr[ix];
      const dy = cy - arr[iy];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CURSOR_INFLUENCE && dist > 0.01) {
        const force = (CURSOR_STRENGTH * (1 - dist / CURSOR_INFLUENCE)) / dist;
        arr[ix] += dx * force * 0.008;
        arr[iy] += dy * force * 0.008;
      }
    }
    posAttr.needsUpdate = true;

    /* Compute connections every 3 frames for performance */
    if (frameCount.current % 3 === 0 && linesRef.current) {
      let lineIdx = 0;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = arr[i * 3] - arr[j * 3];
          const dy = arr[i * 3 + 1] - arr[j * 3 + 1];
          const dz = arr[i * 3 + 2] - arr[j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < CONNECTION_DISTANCE && lineIdx < maxLines) {
            const k = lineIdx * 6;
            linePositions[k] = arr[i * 3];
            linePositions[k + 1] = arr[i * 3 + 1];
            linePositions[k + 2] = arr[i * 3 + 2];
            linePositions[k + 3] = arr[j * 3];
            linePositions[k + 4] = arr[j * 3 + 1];
            linePositions[k + 5] = arr[j * 3 + 2];
            const alpha = (1 - d / CONNECTION_DISTANCE) * 0.18;
            lineAlphas[lineIdx * 2] = alpha;
            lineAlphas[lineIdx * 2 + 1] = alpha;
            lineIdx++;
          }
        }
      }
      lineGeom.setDrawRange(0, lineIdx * 2);
      (lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeom.attributes.alpha as THREE.BufferAttribute).needsUpdate = true;
    }

    /* Subtle group lean toward cursor */
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (pointer.current.x * 0.04 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x +=
        (-pointer.current.y * 0.03 - groupRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={nodeVert}
          fragmentShader={nodeFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Edges */}
      <lineSegments ref={linesRef} geometry={lineGeom} material={lineMat} />
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function ParticleNetwork({
  color,
  lineColor,
}: {
  color: string;
  lineColor: string;
}) {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{
        antialias: false,
        powerPreference: "low-power",
        alpha: true,
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Network
        count={isMobile ? MOBILE_COUNT : DESKTOP_COUNT}
        color={color}
        lineColor={lineColor}
      />
    </Canvas>
  );
}
