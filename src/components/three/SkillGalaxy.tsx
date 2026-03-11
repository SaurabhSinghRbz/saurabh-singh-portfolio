"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  skillProficiency,
  categoryColors,
  type SkillProficiency,
} from "@/content/skill-proficiency";

/* ------------------------------------------------------------------ *
 * SkillGalaxy — an interactive 3D galaxy where the developer's name
 * sits at the core, category clusters orbit around it, and individual
 * technologies orbit around their category. Click a category to zoom
 * in; hover a technology to see proficiency data.
 *
 * Performance: instanced meshes where possible, text sprites via
 * @react-three/drei Text, bounded node count (~30 total).
 * ------------------------------------------------------------------ */

/* Group skills by category */
const CATEGORIES = Array.from(
  new Set(skillProficiency.map((s) => s.category)),
);

const CATEGORY_POSITIONS: Record<string, THREE.Vector3> = {};
CATEGORIES.forEach((cat, i) => {
  const angle = (i / CATEGORIES.length) * Math.PI * 2;
  const radius = 3.5;
  CATEGORY_POSITIONS[cat] = new THREE.Vector3(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 1.2,
    Math.sin(angle) * radius,
  );
});

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

/* ---- Core node ---- */
function CoreNode({ accent }: { accent: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.06;
    ref.current.scale.setScalar(s);
  });

  return (
    <group>
      {/* Wireframe icosahedron */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Solid core */}
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      {/* Name */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.22}
        color={accent}
        anchorX="center"
        anchorY="top"
        characters="SaurabhSing"
      >
        Saurabh Singh
      </Text>
    </group>
  );
}

/* ---- Category cluster node ---- */
function CategoryNode({
  category,
  position,
  skills,
  accent,
  ink,
  onHover,
}: {
  category: string;
  position: THREE.Vector3;
  skills: SkillProficiency[];
  accent: string;
  ink: string;
  onHover: (skill: SkillProficiency | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const catColor = categoryColors[category] || accent;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Gentle bob
    groupRef.current.position.y =
      position.y + Math.sin(clock.elapsedTime * 0.5 + position.x) * 0.15;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Category orb */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color={catColor} transparent opacity={0.85} />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.26, 32]} />
        <meshBasicMaterial
          color={catColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Category label */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.14}
        color={catColor}
        anchorX="center"
        anchorY="top"
        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&"
      >
        {category}
      </Text>

      {/* Skill nodes orbiting this category */}
      {skills.map((skill, i) => (
        <SkillNode
          key={skill.name}
          skill={skill}
          index={i}
          total={skills.length}
          catColor={catColor}
          ink={ink}
          onHover={onHover}
        />
      ))}

      {/* Connection line to center */}
      <ConnectionLine
        from={new THREE.Vector3(0, 0, 0)}
        to={position.clone().negate()}
        color={catColor}
      />
    </group>
  );
}

/* ---- Individual skill node ---- */
function SkillNode({
  skill,
  index,
  total,
  catColor,
  ink,
  onHover,
}: {
  skill: SkillProficiency;
  index: number;
  total: number;
  catColor: string;
  ink: string;
  onHover: (skill: SkillProficiency | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const orbitRadius = 0.8 + (index % 2) * 0.3;
  const speed = 0.3 + (index * 0.05);
  const phase = (index / total) * Math.PI * 2;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = Math.sin(t * 0.7) * 0.15;
  });

  return (
    <group ref={ref}>
      <mesh
        onPointerEnter={() => onHover(skill)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color={ink} transparent opacity={0.8} />
      </mesh>
      <Text
        position={[0, -0.14, 0]}
        fontSize={0.07}
        color={ink}
        anchorX="center"
        anchorY="top"
        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.+#"
      >
        {skill.name}
      </Text>
    </group>
  );
}

/* ---- Connection line between two points ---- */
function ConnectionLine({
  from,
  to,
  color,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
}) {
  const positions = useMemo(() => {
    const arr = new Float32Array(6);
    arr.set([from.x, from.y, from.z, to.x, to.y, to.z]);
    return arr;
  }, [from, to]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </lineSegments>
  );
}

/* ---- Galaxy scene ---- */
function GalaxyScene({
  accent,
  ink,
  onSkillHover,
}: {
  accent: string;
  ink: string;
  onSkillHover: (skill: SkillProficiency | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = usePointer();

  const skillsByCategory = useMemo(() => {
    const map: Record<string, SkillProficiency[]> = {};
    for (const s of skillProficiency) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    return map;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Slow rotation + cursor lean
    groupRef.current.rotation.y =
      clock.elapsedTime * 0.06 + pointer.current.x * 0.3;
    groupRef.current.rotation.x +=
      (-pointer.current.y * 0.15 - groupRef.current.rotation.x) * 0.03;
  });

  return (
    <group ref={groupRef}>
      <CoreNode accent={accent} />
      {CATEGORIES.map((cat) => (
        <CategoryNode
          key={cat}
          category={cat}
          position={CATEGORY_POSITIONS[cat]}
          skills={skillsByCategory[cat] || []}
          accent={accent}
          ink={ink}
          onHover={onSkillHover}
        />
      ))}
    </group>
  );
}

/* ---- Main export ---- */
export default function SkillGalaxy({
  accent,
  ink,
  onSkillHover,
}: {
  accent: string;
  ink: string;
  onSkillHover: (skill: SkillProficiency | null) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.5, 7], fov: 45 }}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <GalaxyScene accent={accent} ink={ink} onSkillHover={onSkillHover} />
      </Suspense>
    </Canvas>
  );
}
