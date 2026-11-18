"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { C, DataPackets, Glow, SceneCanvas, getGlowTexture } from "./common";
import { useLowPower, useReducedMotion } from "@/lib/hooks";

const R = 2;
const ll = (lat: number, lon: number, r = R) => {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const th = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

// Places I've worked: Riyadh (KSA) and Kerala (India)
const RIYADH = ll(24.71, 46.68);
const KERALA = ll(11.05, 75.99);

function greatArc(a: THREE.Vector3, b: THREE.Vector3, h = 0.6) {
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + h);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

function Globe({ light }: { light: boolean }) {
  const low = useLowPower();
  const reduce = useReducedMotion();
  const grp = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const dots = useMemo(() => {
    const n = low ? 700 : 1500;
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(n * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      arr.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [low]);

  const curves = useMemo(() => {
    const extra = [ll(25.2, 55.3), ll(51.5, -0.1), ll(1.35, 103.8), ll(40.7, -74), ll(30.0, 31.2), ll(19.07, 72.88)];
    const list = [greatArc(RIYADH, KERALA, 0.5)];
    extra.forEach((p) => list.push(greatArc(RIYADH, p, 0.45 + Math.random() * 0.5)));
    list.push(greatArc(KERALA, extra[2], 0.6));
    return list;
  }, []);
  const pts = useMemo(() => curves.map((c) => c.getPoints(60)), [curves]);

  useFrame((s, dt) => {
    if (!grp.current) return;
    if (!reduce) grp.current.rotation.y += dt * 0.06;
    grp.current.rotation.x = THREE.MathUtils.damp(grp.current.rotation.x, 0.25 - pointer.y * 0.15, 2, dt);
  });

  return (
    <group ref={grp} rotation={[0.25, -1.9, 0]}>
      <mesh>
        <sphereGeometry args={[R * 0.985, 64, 64]} />
        <meshStandardMaterial color={light ? "#F3ECE2" : "#1E1916"} metalness={light ? 0.1 : 0.6} roughness={light ? 0.8 : 0.5} transparent opacity={light ? 0.9 : 0.85} />
      </mesh>
      <points geometry={dots}>
        <pointsMaterial size={light ? 0.03 : 0.035} color={C.neon} transparent opacity={light ? 0.55 : 0.8} map={getGlowTexture()} depthWrite={false} blending={light ? THREE.NormalBlending : THREE.AdditiveBlending} />
      </points>
      {pts.map((p, i) => (
        <Line key={i} points={p} color={i === 0 ? "#E8401C" : "#C82909"} lineWidth={i === 0 ? 1.6 : 1} transparent opacity={i === 0 ? 0.9 : 0.4} />
      ))}
      <DataPackets curves={curves} perCurve={2} speed={0.22} size={0.03} />
      {[RIYADH, KERALA].map((p, i) => (
        <group key={i} position={p}>
          <mesh><sphereGeometry args={[0.04, 16, 16]} /><meshBasicMaterial color={C.cyan} toneMapped={false} /></mesh>
          <Glow size={0.5} />
        </group>
      ))}
      {/* atmosphere */}
      <mesh scale={1.12}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color={C.neon} transparent opacity={light ? 0.08 : 0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function GlobeScene({ light = true }: { light?: boolean }) {
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0, 6.2], fov: 40 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-4, 3, 5]} intensity={1.2} color="#FFD2BF" />
      <Globe light={light} />
    </SceneCanvas>
  );
}
