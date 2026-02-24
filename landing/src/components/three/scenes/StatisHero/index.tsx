"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import type { Group, Mesh, Points } from "three";
import * as THREE from "three";
import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

// ── Palette ─────────────────────────────────────────────────────────────────
const CYAN   = new THREE.Color("#00ffc8");
const BLUE   = new THREE.Color("#00bfff");
const VIOLET = new THREE.Color("#9a7bff");

function randomPointColor(): THREE.Color {
  const r = Math.random();
  if (r < 0.75) return CYAN.clone();
  if (r < 0.90) return BLUE.clone();
  return VIOLET.clone();
}

// ── Dot Field ────────────────────────────────────────────────────────────────
interface DotFieldProps {
  count: number;
  pointSize: number;
  opacity: number;
  zMin: number;
  zMax: number;
  paused: boolean;
  /** Clear a small gap around the disk center (near field only) */
  avoidCenter?: boolean;
}

function DotField({
  count,
  pointSize,
  opacity,
  zMin,
  zMax,
  paused,
  avoidCenter = false,
}: DotFieldProps) {
  const ref = useRef<Points>(null);

  const { positions, colors, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count * 2); // dx, dy only

    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = (Math.random() - 0.5) * 6.4; // [-3.2, 3.2]
        y = (Math.random() - 0.5) * 4.4; // [-2.2, 2.2]
        attempts++;
      } while (avoidCenter && x * x + y * y < 0.6 * 0.6 && attempts < 10);

      pos[i * 3 + 0] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);

      vel[i * 2 + 0] = (Math.random() - 0.5) * 0.006;
      vel[i * 2 + 1] = (Math.random() - 0.5) * 0.004;

      const c = randomPointColor();
      col[i * 3 + 0] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col, velocities: vel };
  }, [count, zMin, zMax, avoidCenter]);

  useFrame(() => {
    if (paused || !ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] += velocities[i * 2 + 0];
      arr[i * 3 + 1] += velocities[i * 2 + 1];
      // wrap
      if (arr[i * 3 + 0] > 3.2)  arr[i * 3 + 0] -= 6.4;
      if (arr[i * 3 + 0] < -3.2) arr[i * 3 + 0] += 6.4;
      if (arr[i * 3 + 1] > 2.2)  arr[i * 3 + 1] -= 4.4;
      if (arr[i * 3 + 1] < -2.2) arr[i * 3 + 1] += 4.4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        transparent
        opacity={opacity}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ── Golden Record Disk ───────────────────────────────────────────────────────
const INNER_RING_COUNT = 7;

function GoldenRecord({ paused }: { paused: boolean }) {
  const tiltRef = useRef<Group>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layerRefs = useRef<Array<Mesh | null>>(
    Array(INNER_RING_COUNT).fill(null),
  );
  const { pointer } = useThree();

  // Ring configs: smallest to largest, flat disks stacked inside cylinder
  const ringConfigs = useMemo(
    () =>
      Array.from({ length: INNER_RING_COUNT }, (_, i) => ({
        r: 0.06 + i * 0.064, // 0.06 → 0.444
        h: 0.002 + i * 0.0003,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!tiltRef.current) return;

    if (!paused) {
      // Hover tilt — clamp ±15° (≈0.26 rad)
      const targetX = THREE.MathUtils.clamp(-pointer.y * 0.26, -0.26, 0.26);
      const targetY = THREE.MathUtils.clamp(pointer.x * 0.26, -0.26, 0.26);
      tiltRef.current.rotation.x = THREE.MathUtils.lerp(
        tiltRef.current.rotation.x,
        targetX,
        0.05,
      );
      tiltRef.current.rotation.y = THREE.MathUtils.lerp(
        tiltRef.current.rotation.y,
        targetY,
        0.05,
      );

      // Pulse inner layers — each ring has its own phase
      const t = clock.getElapsedTime();
      for (let i = 0; i < INNER_RING_COUNT; i++) {
        const m = layerRefs.current[i];
        if (!m) continue;
        const mat = m.material as THREE.MeshStandardMaterial;
        const phase = (i / INNER_RING_COUNT) * Math.PI * 2;
        const wave = 0.5 + 0.5 * Math.sin(t * 0.22 + phase);
        mat.emissiveIntensity = 0.25 + wave * 0.55;
        mat.opacity = 0.18 + wave * 0.26;
        mat.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={tiltRef}>
      {/* Orient disk face toward camera (Z): rotate cylinder axis Y → Z */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Glass side wall */}
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.07, 64, 1, true]} />
          <meshPhysicalMaterial
            color="#1a3040"
            transparent
            opacity={0.28}
            roughness={0.04}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Front glass face */}
        <mesh position={[0, 0.035, 0]}>
          <circleGeometry args={[0.55, 64]} />
          <meshPhysicalMaterial
            color="#1a3040"
            transparent
            opacity={0.15}
            roughness={0.04}
            metalness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={0.9}
          />
        </mesh>

        {/* Back glass face */}
        <mesh position={[0, -0.035, 0]} rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[0.55, 64]} />
          <meshPhysicalMaterial
            color="#1a3040"
            transparent
            opacity={0.15}
            roughness={0.04}
            metalness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={0.9}
          />
        </mesh>

        {/* Inner emissive rings */}
        {ringConfigs.map(({ r, h }, i) => (
          <mesh
            key={i}
            ref={(el: Mesh | null) => {
              layerRefs.current[i] = el;
            }}
          >
            <cylinderGeometry args={[r, r, h, 48]} />
            <meshStandardMaterial
              color={CYAN}
              emissive={CYAN}
              emissiveIntensity={0.4}
              transparent
              opacity={0.22}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Outer rim glow (torus around the edge) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.004, 6, 64]} />
          <meshStandardMaterial
            color={CYAN}
            emissive={CYAN}
            emissiveIntensity={2.5}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ── Main Scene ───────────────────────────────────────────────────────────────
export default function StatisHeroScene() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPaused(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <fog attach="fog" args={["#0a0a0f", 8, 18]} />
      <Environment preset="studio" environmentIntensity={0.85} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 3, 5]} intensity={0.25} color="#eaf6ff" />
      {/* Cyan fill — front left */}
      <pointLight position={[-1.5, 1, 3]} intensity={1.0} color="#00ffc8" />
      {/* Cool rim — back right */}
      <pointLight position={[2, -1, -2]} intensity={0.4} color="#8fa8ff" />

      {/* Far dot cloud — low opacity background */}
      <DotField
        count={3200}
        pointSize={0.012}
        opacity={0.35}
        zMin={-3.2}
        zMax={-1.2}
        paused={paused}
      />

      {/* Near dot cloud — slightly larger, more transparent */}
      <DotField
        count={1100}
        pointSize={0.024}
        opacity={0.18}
        zMin={-1.2}
        zMax={0.6}
        paused={paused}
        avoidCenter
      />

      <GoldenRecord paused={paused} />
    </>
  );
}
