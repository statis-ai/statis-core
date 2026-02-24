"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, BufferAttribute } from "three";
import * as THREE from "three";
import {
  DRIFT_SPEED,
  BREATHING_SPEED,
  BREATHING_AMPLITUDE,
  PARTICLE_COUNT,
  PARTICLE_SPAWN_RADIUS,
  PARTICLE_CORE_RADIUS,
  PARTICLE_SPEED,
  CRYSTALLIZE_INTERVAL_MIN,
  CRYSTALLIZE_INTERVAL_MAX,
  CRYSTALLIZE_DURATION,
  REPLAY_INTERVAL_MIN,
  REPLAY_INTERVAL_MAX,
  REPLAY_DURATION,
  RING_COUNT,
  PARALLAX_SENSITIVITY,
  PARALLAX_LERP,
} from "./constants";

export function useDrift(groupRef: React.RefObject<Group | null>) {
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += DRIFT_SPEED * delta;
  });
}

export function useBreathing(groupRef: React.RefObject<Group | null>) {
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * BREATHING_SPEED) * BREATHING_AMPLITUDE;
    groupRef.current.scale.setScalar(scale);
  });
}

export function useMouseParallax(groupRef: React.RefObject<Group | null>) {
  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * PARALLAX_SENSITIVITY,
      PARALLAX_LERP,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * PARALLAX_SENSITIVITY,
      PARALLAX_LERP,
    );
  });
}

interface ParticleState {
  angles: Float32Array;
  radii: Float32Array;
  yOffsets: Float32Array;
  speeds: Float32Array;
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function resetParticle(state: ParticleState, i: number) {
  state.angles[i] = Math.random() * Math.PI * 2;
  state.radii[i] = PARTICLE_SPAWN_RADIUS;
  state.yOffsets[i] = (Math.random() - 0.5) * 1.5;
  state.speeds[i] = PARTICLE_SPEED * (0.7 + Math.random() * 0.6);
}

export function useParticles(
  onImpact?: () => void,
): {
  pointsRef: React.RefObject<THREE.Points | null>;
  particleState: ParticleState;
} {
  const pointsRef = useRef<THREE.Points>(null);

  const particleState = useMemo<ParticleState>(() => {
    const s: ParticleState = {
      angles: new Float32Array(PARTICLE_COUNT),
      radii: new Float32Array(PARTICLE_COUNT),
      yOffsets: new Float32Array(PARTICLE_COUNT),
      speeds: new Float32Array(PARTICLE_COUNT),
    };
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      resetParticle(s, i);
      s.radii[i] = randomRange(PARTICLE_CORE_RADIUS, PARTICLE_SPAWN_RADIUS);
    }
    return s;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes
      .position as BufferAttribute;
    const arr = positions.array as Float32Array;

    let hadImpact = false;
    const ps = particleState;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ps.angles[i] += delta * 0.5;
      ps.radii[i] -= ps.speeds[i] * delta;

      if (ps.radii[i] <= PARTICLE_CORE_RADIUS) {
        resetParticle(ps, i);
        hadImpact = true;
      }

      const r = ps.radii[i];
      const a = ps.angles[i];
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = ps.yOffsets[i];
      arr[i * 3 + 2] = Math.sin(a) * r;
    }

    positions.needsUpdate = true;

    if (hadImpact && onImpact) {
      onImpact();
    }
  });

  return { pointsRef, particleState };
}

export function useImpact(layerRefs: React.RefObject<(Group | null)[]>) {
  const impactStrength = useRef(0);

  const trigger = useCallback(() => {
    impactStrength.current = 1;
  }, []);

  useFrame((_, delta) => {
    if (impactStrength.current <= 0) return;
    impactStrength.current = Math.max(0, impactStrength.current - delta * 4);

    const layers = layerRefs.current;
    if (!layers) return;
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer) continue;
      const wobble =
        Math.sin(Date.now() * 0.02 + i * 1.5) *
        impactStrength.current *
        0.03;
      layer.position.y += wobble;
    }
  });

  return trigger;
}

export function useCrystallize(groupRef: React.RefObject<Group | null>) {
  const nextTrigger = useRef(
    randomRange(CRYSTALLIZE_INTERVAL_MIN, CRYSTALLIZE_INTERVAL_MAX),
  );
  const progress = useRef(0);
  const active = useRef(false);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    if (!active.current && elapsed >= nextTrigger.current) {
      active.current = true;
      progress.current = 0;
    }

    if (active.current) {
      progress.current += delta / CRYSTALLIZE_DURATION;
      if (progress.current >= 1) {
        active.current = false;
        nextTrigger.current =
          elapsed +
          randomRange(CRYSTALLIZE_INTERVAL_MIN, CRYSTALLIZE_INTERVAL_MAX);
        progress.current = 0;
      }
    }

    if (!groupRef.current) return;
    const t = active.current
      ? Math.sin(progress.current * Math.PI) * 0.06
      : 0;
    groupRef.current.scale.setScalar(
      1 +
        Math.sin(clock.getElapsedTime() * BREATHING_SPEED) *
          BREATHING_AMPLITUDE -
        t,
    );
  });
}

export function useReplayRipple(
  layerRefs: React.RefObject<(Group | null)[]>,
) {
  const nextTrigger = useRef(
    randomRange(REPLAY_INTERVAL_MIN, REPLAY_INTERVAL_MAX),
  );
  const progress = useRef(0);
  const active = useRef(false);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    if (!active.current && elapsed >= nextTrigger.current) {
      active.current = true;
      progress.current = 0;
    }

    if (active.current) {
      progress.current += delta / REPLAY_DURATION;
      if (progress.current >= 1) {
        active.current = false;
        nextTrigger.current =
          elapsed +
          randomRange(REPLAY_INTERVAL_MIN, REPLAY_INTERVAL_MAX);
        progress.current = 0;
      }
    }

    const layers = layerRefs.current;
    if (!layers || !active.current) return;

    const wave = Math.sin(progress.current * Math.PI);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer) continue;
      const spread = wave * 0.08 * (i / RING_COUNT - 0.5);
      layer.position.y += spread;
    }
  });
}
