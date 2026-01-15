"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT_DESKTOP = 3800;
const COUNT_MOBILE = 1600;

/* ------------------------------------------------------------------ *
 * Shared pointer state (normalized device coords), fed by a window
 * listener since the canvas itself is pointer-events: none.
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ *
 * Particles: lanes of "transactions" flowing left → right, gently
 * repelled by the cursor.
 * ------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  attribute vec3 seed;
  uniform float uTime;
  uniform vec2 uPointer; // world coords at z=0
  varying float vAlpha;

  void main() {
    float span = 22.0;
    float speed = 0.35 + seed.z * 0.55;
    float x = mod(seed.x + uTime * speed, span) - span * 0.5;

    float y = seed.y
      + 0.45 * sin(x * 0.55 + seed.z * 6.2831 + uTime * 0.4)
      + 0.18 * sin(x * 1.7 + seed.z * 12.0 - uTime * 0.7);
    float z = 0.8 * sin(x * 0.3 + seed.z * 6.2831);

    y *= 0.75 + 0.25 * smoothstep(0.0, 6.0, abs(x));

    // Cursor repulsion — particles part around the pointer like a wake.
    vec2 delta = vec2(x, y) - uPointer;
    float d = length(delta);
    vec2 push = normalize(delta + 0.0001) * (0.9 / (1.0 + d * d * 1.4));
    x += push.x; y += push.y;

    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + seed.z * 2.2) * (10.0 / -mv.z);

    float edge = 1.0 - smoothstep(7.0, 11.0, abs(x));
    vAlpha = edge * (0.22 + seed.z * 0.5);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.12, d);
    gl_FragColor = vec4(uColor, disc * vAlpha);
  }
`;

function Particles({ count, color }: { count: number; color: string }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const { viewport } = useThree();

  const { positions, seeds, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = Math.random() * 22;
      seeds[i * 3 + 1] = (Math.random() - 0.5) * 9;
      seeds[i * 3 + 2] = Math.random();
    }
    const uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPointer: { value: new THREE.Vector2(999, 999) },
    };
    return { positions, seeds, uniforms };
  }, [count, color]);

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.uTime.value = clock.elapsedTime;
      material.current.uniforms.uPointer.value.set(
        (pointer.current.x * viewport.width) / 2,
        (pointer.current.y * viewport.height) / 2,
      );
    }
    // Whole field leans slightly with the cursor — cheap depth parallax.
    if (group.current) {
      group.current.rotation.y += (pointer.current.x * 0.06 - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (-pointer.current.y * 0.04 - group.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-seed" args={[seeds, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * GiftCard: a floating 3D gift card (canvas-drawn front & back) that
 * tilts toward the cursor and flips over when you hover it — front
 * has the number / expiry / Mastercard mark, back has the magstripe,
 * signature strip and CVV.
 * ------------------------------------------------------------------ */
const CARD_W = 1024;
const CARD_H = 640;
const CARD_POS = new THREE.Vector3(4.15, 0.4, 1);
const CARD_SIZE = { w: 3.65, h: 2.28 };

function cardBase(accent: string) {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const g = c.getContext("2d")!;
  const r = 56;

  const rounded = () => {
    g.beginPath();
    g.moveTo(r, 0);
    g.arcTo(CARD_W, 0, CARD_W, CARD_H, r);
    g.arcTo(CARD_W, CARD_H, 0, CARD_H, r);
    g.arcTo(0, CARD_H, 0, 0, r);
    g.arcTo(0, 0, CARD_W, 0, r);
    g.closePath();
  };

  // Card body — deep pine gradient (reads as a physical card on both themes)
  rounded();
  const body = g.createLinearGradient(0, 0, CARD_W, CARD_H);
  body.addColorStop(0, "#13201c");
  body.addColorStop(0.6, "#0c1512");
  body.addColorStop(1, "#111e19");
  g.fillStyle = body;
  g.fill();

  // Accent sweep, bottom-right
  g.save();
  rounded();
  g.clip();
  const sweep = g.createRadialGradient(
    CARD_W * 0.92, CARD_H * 1.05, 40,
    CARD_W * 0.92, CARD_H * 1.05, 620,
  );
  sweep.addColorStop(0, accent);
  sweep.addColorStop(0.45, accent + "33");
  sweep.addColorStop(1, "transparent");
  g.fillStyle = sweep;
  g.fillRect(0, 0, CARD_W, CARD_H);

  // Fine flow lines echoing the particle field
  g.strokeStyle = "rgba(232,239,234,0.05)";
  g.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    for (let x = 0; x <= CARD_W; x += 16) {
      const y = CARD_H * 0.32 + i * 34 + Math.sin(x * 0.008 + i * 1.4) * 22;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();

  // Border
  rounded();
  g.strokeStyle = "rgba(232,239,234,0.14)";
  g.lineWidth = 3;
  g.stroke();

  return { canvas: c, g, rounded };
}

function drawMastercard(g: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const off = r * 0.62;
  g.save();
  g.fillStyle = "#EB001B";
  g.beginPath();
  g.arc(cx - off, cy, r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#F79E1B";
  g.beginPath();
  g.arc(cx + off, cy, r, 0, Math.PI * 2);
  g.fill();
  // Interlock: repaint the lens where the circles overlap
  g.beginPath();
  g.arc(cx - off, cy, r, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = "#FF5F00";
  g.beginPath();
  g.arc(cx + off, cy, r, 0, Math.PI * 2);
  g.fill();
  g.restore();

  g.fillStyle = "rgba(232,239,234,0.8)";
  g.font = "500 26px system-ui, sans-serif";
  g.textAlign = "center";
  g.fillText("mastercard", cx, cy + r + 34);
  g.textAlign = "left";
}

function makeFrontTexture(accent: string) {
  const { canvas, g } = cardBase(accent);

  // Chip
  g.fillStyle = "rgba(232,239,234,0.16)";
  g.strokeStyle = "rgba(232,239,234,0.35)";
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(84, 96, 118, 88, 16);
  g.fill();
  g.stroke();
  // Chip contact lines
  g.beginPath();
  g.moveTo(84, 140);
  g.lineTo(202, 140);
  g.moveTo(143, 96);
  g.lineTo(143, 184);
  g.strokeStyle = "rgba(232,239,234,0.22)";
  g.lineWidth = 2;
  g.stroke();

  // Contactless arcs
  g.strokeStyle = "rgba(232,239,234,0.4)";
  g.lineWidth = 6;
  for (let i = 1; i <= 3; i++) {
    g.beginPath();
    g.arc(268, 140, i * 16, -0.9, 0.9);
    g.stroke();
  }

  // Gift-card label, top-right
  g.font = "400 22px monospace";
  g.fillStyle = "rgba(232,239,234,0.45)";
  g.textAlign = "right";
  g.fillText("GIFT CARD · QUEUES · PAYMENTS", CARD_W - 84, 130);
  g.textAlign = "left";

  // Card number — embossed: dark drop shadow under light digits
  const number = "5244  3108  4521  7690";
  g.font = "600 68px 'Courier New', monospace";
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillText(number, 86, 393);
  g.fillStyle = "#e8efea";
  g.fillText(number, 84, 390);

  // Expiry
  g.font = "400 20px monospace";
  g.fillStyle = "rgba(232,239,234,0.5)";
  g.fillText("VALID", 84, 458);
  g.fillText("THRU", 84, 482);
  g.font = "600 40px 'Courier New', monospace";
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillText("12/28", 162, 481);
  g.fillStyle = "#e8efea";
  g.fillText("12/28", 160, 479);

  // Cardholder
  g.font = "500 34px monospace";
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillText("SAURABH SINGH", 86, 573);
  g.fillStyle = "rgba(232,239,234,0.9)";
  g.fillText("SAURABH SINGH", 84, 571);

  // Mastercard mark, bottom-right
  drawMastercard(g, CARD_W - 180, 500, 58);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBackTexture(accent: string) {
  const { canvas, g } = cardBase(accent);

  // Magnetic stripe
  const stripe = g.createLinearGradient(0, 70, 0, 174);
  stripe.addColorStop(0, "#151515");
  stripe.addColorStop(0.5, "#040404");
  stripe.addColorStop(1, "#181818");
  g.fillStyle = stripe;
  g.fillRect(0, 70, CARD_W, 104);

  // Signature strip + CVV
  g.font = "400 20px monospace";
  g.fillStyle = "rgba(232,239,234,0.5)";
  g.fillText("AUTHORIZED SIGNATURE", 84, 248);
  g.textAlign = "right";
  g.fillText("CVV", 904, 248);
  g.textAlign = "left";

  g.fillStyle = "#efece4";
  g.fillRect(84, 264, 600, 72);
  // Signature-strip guilloché lines
  g.strokeStyle = "rgba(28,42,35,0.18)";
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(84, 276 + i * 14);
    g.lineTo(684, 276 + i * 14);
    g.stroke();
  }
  g.fillStyle = "#1c2a23";
  g.font = "italic 600 42px Georgia, serif";
  g.fillText("Saurabh Singh", 116, 316);

  g.fillStyle = "#efece4";
  g.fillRect(760, 264, 144, 72);
  g.fillStyle = "#1c2a23";
  g.font = "600 40px 'Courier New', monospace";
  g.textAlign = "center";
  g.fillText("500", 832, 314); // the only CVV I'll ever leak: my TPS
  g.textAlign = "left";

  // Fine print
  g.font = "400 21px monospace";
  g.fillStyle = "rgba(232,239,234,0.45)";
  g.fillText("Issued by saurabh.os — backed by a 500+ TPS activation queue.", 84, 420);
  g.fillText("Redeemable anywhere reliability matters.", 84, 454);

  // Support line + mini mark
  g.font = "400 20px monospace";
  g.fillStyle = "rgba(232,239,234,0.35)";
  g.fillText("SUPPORT: github.com/SaurabhSinghRbz", 84, 552);
  drawMastercard(g, CARD_W - 168, 520, 40);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function GiftCard({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  const flip = useRef(0); // eased 0 (front) → PI (back)
  const pointer = usePointer();
  const { camera } = useThree();

  const front = useMemo(() => makeFrontTexture(accent), [accent]);
  const back = useMemo(() => makeBackTexture(accent), [accent]);
  useEffect(
    () => () => {
      front.dispose();
      back.dispose();
    },
    [front, back],
  );

  const ndc = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!group.current) return;

    // Idle float + drift.
    group.current.position.y = CARD_POS.y + Math.sin(t * 0.8) * 0.18;

    // Is the cursor over the card? Compare in screen space (the canvas is
    // pointer-events: none, so raycasting isn't available).
    ndc.copy(group.current.position).project(camera);
    const over =
      Math.abs(pointer.current.x - ndc.x) < 0.22 &&
      Math.abs(pointer.current.y - ndc.y) < 0.27;

    // Hovering turns the card over to the CVV side.
    flip.current += ((over ? Math.PI : 0) - flip.current) * 0.08;

    const lean = 1 - flip.current / Math.PI; // damp the lean while flipped
    const targetY =
      flip.current + (-0.5 + pointer.current.x * 0.45) * lean + Math.sin(t * 0.35) * 0.08;
    const targetX = (-0.18 - pointer.current.y * 0.3) * lean + Math.cos(t * 0.28) * 0.05;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.09;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
  });

  return (
    <group ref={group} position={CARD_POS}>
      <mesh>
        <planeGeometry args={[CARD_SIZE.w, CARD_SIZE.h]} />
        <meshBasicMaterial map={front} transparent side={THREE.FrontSide} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.002]}>
        <planeGeometry args={[CARD_SIZE.w, CARD_SIZE.h]} />
        <meshBasicMaterial map={back} transparent side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function FlowField({ color }: { color: string }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const showCard = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: false, powerPreference: "low-power", alpha: true }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Particles count={isMobile ? COUNT_MOBILE : COUNT_DESKTOP} color={color} />
      {showCard && <GiftCard accent={color} />}
    </Canvas>
  );
}
