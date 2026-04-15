"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Node positions: agents on left, policy center, targets on right ── */
const NODES = [
  // Agents (left cluster)
  { pos: [-3.2, 1.2, 0], label: "agent", size: 0.06 },
  { pos: [-3.0, -0.3, 0.5], label: "agent", size: 0.06 },
  { pos: [-2.8, -1.5, -0.3], label: "agent", size: 0.06 },
  { pos: [-3.5, 0.4, -0.6], label: "agent", size: 0.05 },

  // Policy engine (center)
  { pos: [0, 0, 0], label: "policy", size: 0.12 },

  // Execution targets (right cluster)
  { pos: [3.0, 1.4, 0.2], label: "target", size: 0.06 },
  { pos: [3.2, 0.0, -0.4], label: "target", size: 0.06 },
  { pos: [2.8, -1.2, 0.3], label: "target", size: 0.06 },
  { pos: [3.4, -0.5, 0.6], label: "target", size: 0.05 },
];

/* ── Flow paths: agent → policy → target ── */
const FLOWS = [
  { from: 0, through: 4, to: 5 },
  { from: 1, through: 4, to: 6 },
  { from: 2, through: 4, to: 7 },
  { from: 3, through: 4, to: 8 },
];

/* ── Ring around policy node ── */
function PolicyRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.008, 16, 64]} />
      <meshBasicMaterial color="#00D4FF" opacity={0.5} transparent />
    </mesh>
  );
}

/* ── Connection line between two points ── */
function ConnectionLine({
  start,
  end,
  color,
  opacity = 0.12,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  opacity?: number;
}) {
  const geo = useMemo(() => {
    const pts = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [start, end]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial color={color} opacity={opacity} transparent />
    </line>
  );
}

/* ── Flowing particle along a path ── */
function FlowParticle({
  from,
  through,
  to,
  delay,
  speed = 0.4,
}: {
  from: [number, number, number];
  through: [number, number, number];
  to: [number, number, number];
  delay: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + delay;
    const progress = (t % 2) / 2; // 0-1 over 2 seconds, loop

    let x, y, z;
    if (progress < 0.5) {
      // from → through
      const p = progress * 2;
      x = from[0] + (through[0] - from[0]) * p;
      y = from[1] + (through[1] - from[1]) * p;
      z = from[2] + (through[2] - from[2]) * p;
    } else {
      // through → to
      const p = (progress - 0.5) * 2;
      x = through[0] + (to[0] - through[0]) * p;
      y = through[1] + (to[1] - through[1]) * p;
      z = through[2] + (to[2] - through[2]) * p;
    }

    ref.current.position.set(x, y, z);
    // Pulse opacity
    ref.current.material.opacity = 0.4 + Math.sin(progress * Math.PI) * 0.6;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#00D4FF" opacity={0.8} transparent />
    </mesh>
  );
}

/* ── Background particles for depth ── */
function BackgroundParticles({ count = 80 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.015} opacity={0.15} transparent sizeAttenuation />
    </points>
  );
}

/* ── Main scene ── */
export function PipelineScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle float
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.08;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <>
      <BackgroundParticles />
      <group ref={groupRef}>
        {/* Nodes */}
        {NODES.map((node, i) => (
          <mesh key={i} position={node.pos as [number, number, number]}>
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshBasicMaterial
              color={node.label === "policy" ? "#00D4FF" : "#ffffff"}
              opacity={node.label === "policy" ? 0.9 : 0.5}
              transparent
            />
          </mesh>
        ))}

        {/* Policy ring */}
        <PolicyRing />

        {/* Connection lines */}
        {FLOWS.map((flow, i) => (
          <group key={i}>
            <ConnectionLine
              start={NODES[flow.from].pos as [number, number, number]}
              end={NODES[flow.through].pos as [number, number, number]}
              color="#ffffff"
              opacity={0.06}
            />
            <ConnectionLine
              start={NODES[flow.through].pos as [number, number, number]}
              end={NODES[flow.to].pos as [number, number, number]}
              color="#00D4FF"
              opacity={0.1}
            />
          </group>
        ))}

        {/* Flow particles */}
        {FLOWS.map((flow, i) => (
          <FlowParticle
            key={i}
            from={NODES[flow.from].pos as [number, number, number]}
            through={NODES[flow.through].pos as [number, number, number]}
            to={NODES[flow.to].pos as [number, number, number]}
            delay={i * 0.5}
            speed={0.35}
          />
        ))}
      </group>
    </>
  );
}
