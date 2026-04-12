"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Topology: a 3D hub-and-spoke system graph — the queue platform at
 * the core, satellite services around it, and packets ("messages")
 * streaming along the edges. Echoes the Figma "Network Topology"
 * panel, but as a living scene instead of a static SVG.
 * ------------------------------------------------------------------ */

const SATELLITES = 8;
const RADIUS = 2.1;

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

function Graph({ accent, ink }: { accent: string; ink: string }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const packetsRef = useRef<THREE.InstancedMesh>(null);
  const pointer = usePointer();

  const { nodes, edges, linePositions } = useMemo(() => {
    // Satellites on a jittered sphere shell around the origin.
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < SATELLITES; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / SATELLITES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      nodes.push(
        new THREE.Vector3(
          RADIUS * Math.sin(phi) * Math.cos(theta),
          RADIUS * Math.cos(phi) * 0.72,
          RADIUS * Math.sin(phi) * Math.sin(theta),
        ),
      );
    }
    // Every satellite links to the core; a few neighbor links for mesh feel.
    const edges: [THREE.Vector3, THREE.Vector3][] = nodes.map((n) => [
      n,
      new THREE.Vector3(0, 0, 0),
    ]);
    for (let i = 0; i < SATELLITES; i += 2) {
      edges.push([nodes[i], nodes[(i + 3) % SATELLITES]]);
    }

    const linePositions = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      linePositions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    return { nodes, edges, linePositions };
  }, []);

  // One packet per edge, each with its own phase and speed.
  const packetSeeds = useMemo(
    () => edges.map((_, i) => ({ phase: (i * 0.37) % 1, speed: 0.25 + ((i * 7919) % 100) / 260 })),
    [edges],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (group.current) {
      // Slow idle spin + gentle lean toward the cursor.
      group.current.rotation.y = t * 0.12 + pointer.current.x * 0.25;
      group.current.rotation.x += (pointer.current.y * -0.18 - group.current.rotation.x) * 0.04;
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 2.1) * 0.06; // heartbeat
      core.current.scale.setScalar(s);
    }
    if (packetsRef.current) {
      packetSeeds.forEach((seed, i) => {
        const [from, to] = edges[i];
        // Ping-pong along the edge: out to the core and back.
        const raw = (t * seed.speed + seed.phase) % 2;
        const k = raw < 1 ? raw : 2 - raw;
        dummy.position.lerpVectors(from, to, k);
        dummy.scale.setScalar(0.045);
        dummy.updateMatrix();
        packetsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      packetsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ink} transparent opacity={0.18} />
      </lineSegments>

      {/* Core — the queue platform */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Satellite services */}
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.085, 12, 12]} />
          <meshBasicMaterial color={ink} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* Packets in flight */}
      <instancedMesh ref={packetsRef} args={[undefined, undefined, edges.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={accent} transparent opacity={0.95} />
      </instancedMesh>
    </group>
  );
}

export default function Topology({ accent, ink }: { accent: string; ink: string }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 5.2], fov: 45 }}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      aria-hidden
    >
      <Graph accent={accent} ink={ink} />
    </Canvas>
  );
}
