import { MeshPhysicalMaterial, Color } from "three";

export function createStrataMaterial(opacity: number): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: new Color("#00ffc8"),
    transparent: true,
    opacity: Math.min(opacity * 1.2, 0.5),
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.85,
    thickness: 1.0,
    ior: 1.8,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.6,
    side: 2,
  });
}

export function createParticleMaterial(): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color: new Color("#00ffc8"),
    transparent: true,
    opacity: 0.7,
    roughness: 0.3,
    emissive: new Color("#00ffc8"),
    emissiveIntensity: 0.4,
  });
}
