"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { C, DataPackets, Glow, SceneCanvas } from "./common";
import { useReducedMotion } from "@/lib/hooks";

/** Central controller with orbiting field devices — the About section's 3D object. */
function Ecosystem() {
  const reduce = useReducedMotion();
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const sats = useMemo(() => {
    const out: { p: THREE.Vector3; kind: number }[] = [];
    const rings = [{ r: 1.7, n: 5, y: 0.35 }, { r: 2.5, n: 7, y: -0.3 }];
    rings.forEach(({ r, n, y }, ri) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ri * 0.4;
        out.push({ p: new THREE.Vector3(Math.cos(a) * r, y + Math.sin(a * 2) * 0.25, Math.sin(a) * r), kind: (i + ri) % 3 });
      }
    });
    return out;
  }, []);
  const curves = useMemo(() => sats.map((s) => new THREE.QuadraticBezierCurve3(s.p, s.p.clone().multiplyScalar(0.5).setY(s.p.y + 0.6), new THREE.Vector3(0, 0, 0))), [sats]);
  const linePts = useMemo(() => curves.map((c) => c.getPoints(24)), [curves]);

  useFrame((s, dt) => {
    if (!root.current || !core.current) return;
    if (!reduce) {
      root.current.rotation.y += dt * 0.12;
      core.current.rotation.y -= dt * 0.4;
      core.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.5) * 0.15;
    }
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.35 - pointer.y * 0.2, 3, dt);
    root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, pointer.x * 0.1, 3, dt);
  });

  return (
    <group ref={root} rotation={[0.35, 0, 0]}>
      <group ref={core}>
        <mesh>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#2E201B" metalness={0.9} roughness={0.15} />
          <Edges color="#E8401C" />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.85, 1]} />
          <meshBasicMaterial color={C.neon} wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>
      </group>
      <Glow size={2.4} opacity={0.45} />
      {[1.7, 2.5].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.005, 6, 128]} />
          <meshBasicMaterial color={C.neon} transparent opacity={0.3} toneMapped={false} />
        </mesh>
      ))}
      {sats.map(({ p, kind }, i) => (
        <group key={i} position={p}>
          {kind === 0 && (
            <RoundedBox args={[0.26, 0.04, 0.16]} radius={0.01}>
              <meshStandardMaterial color="#1E1916" metalness={0.5} roughness={0.4} />
              <Edges color="#E8401C" transparent opacity={0.7} />
            </RoundedBox>
          )}
          {kind === 1 && (
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
              <meshStandardMaterial color="#e8eef8" roughness={0.4} />
            </mesh>
          )}
          {kind === 2 && (
            <mesh>
              <octahedronGeometry args={[0.09]} />
              <meshStandardMaterial color={C.cyan} emissive={C.cyan} emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          )}
          <Glow size={0.45} opacity={0.5} color={kind === 2 ? C.cyan : C.neon} />
        </group>
      ))}
      {linePts.map((pts, i) => (
        <Line key={i} points={pts} color="#C82909" lineWidth={1} transparent opacity={0.3} />
      ))}
      <DataPackets curves={curves} perCurve={2} speed={0.4} size={0.03} />
    </group>
  );
}

export default function EcosystemScene() {
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 1.2, 6.4], fov: 40 }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#FFF0E6" />
      <pointLight position={[0, 0, 0]} intensity={5} distance={5} color="#E8401C" />
      <Ecosystem />
    </SceneCanvas>
  );
}
