"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { C, DataPackets, DustField, Glow, SceneCanvas, arc } from "./common";
import { useLowPower, useReducedMotion } from "@/lib/hooks";
import { HeroFallback } from "./HeroFallback";
import { HeroDevices } from "./HeroDevices";

/* ── Smart tower: glass floors, steel slabs, lit window bands ── */
function Tower({ floors = 14, w = 1.7, d = 1.25, fh = 0.26, position = [0, 0, 0] as [number, number, number], seed = 1 }) {
  const bands = useRef<THREE.MeshBasicMaterial[]>([]);
  const lit = useMemo(() => Array.from({ length: floors }, (_, i) => 0.25 + ((Math.sin(i * 12.9898 * seed) * 43758.5453) % 1 + 1) % 1 * 0.75), [floors, seed]);
  const reduce = useReducedMotion();

  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.elapsedTime;
    bands.current.forEach((m, i) => m && (m.opacity = 0.16 + lit[i] * 0.5 * (0.75 + 0.25 * Math.sin(t * 0.6 + i * 1.7))));
  });

  return (
    <group position={position}>
      {Array.from({ length: floors }).map((_, i) => {
        const taper = 1 - (i / floors) * 0.12;
        const y = i * fh;
        return (
          <group key={i} position={[0, y, 0]}>
            {/* slab */}
            <mesh position={[0, 0.012, 0]} castShadow>
              <boxGeometry args={[w * taper + 0.06, 0.024, d * taper + 0.06]} />
              <meshStandardMaterial color="#221C19" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* curtain wall */}
            <mesh position={[0, fh / 2 + 0.012, 0]}>
              <boxGeometry args={[w * taper, fh - 0.024, d * taper]} />
              <meshStandardMaterial color="#3A2A24" metalness={0.55} roughness={0.15} transparent opacity={0.45} envMapIntensity={1.4} />
              <Edges color="#D9573A" threshold={15} transparent opacity={0.35} />
            </mesh>
            {/* lit interior band */}
            <mesh position={[0, fh / 2, 0]}>
              <boxGeometry args={[w * taper - 0.08, fh * 0.42, d * taper - 0.08]} />
              <meshBasicMaterial ref={(m) => { if (m) bands.current[i] = m; }} color={i % 4 === 0 ? C.cyan : C.neon} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
      {/* crown */}
      <mesh position={[0, floors * fh + 0.08, 0]}>
        <boxGeometry args={[w * 0.6, 0.16, d * 0.6]} />
        <meshStandardMaterial color="#221C19" metalness={0.9} roughness={0.3} />
        <Edges color="#E8401C" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ── PIF Tower (KAFD, Riyadh), stylised architectural model:
      reflective champagne glass curtain wall, faceted shaft that folds as it rises,
      crystalline crown with glowing ridges, stone-and-glass podium ── */

/** Curtain-wall texture: sky reflection gradient, sheen, mullions, warm floor glow. */
function makeFacade(light: boolean, crown = false) {
  const W = 512, H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, H);
  if (light) {
    sky.addColorStop(0, crown ? "#fff4ea" : "#fff2e8");
    sky.addColorStop(0.4, crown ? "#f6cdb8" : "#e9c3b1");
    sky.addColorStop(0.75, crown ? "#e39a7c" : "#b48a7c");
    sky.addColorStop(1, crown ? "#c86a4f" : "#7d625a");
  } else {
    sky.addColorStop(0, crown ? "#a4513b" : "#6e4a3f");
    sky.addColorStop(0.5, crown ? "#5a2a1f" : "#3b2a25");
    sky.addColorStop(1, "#1d1513");
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  // diagonal sheen
  const sh = g.createLinearGradient(0, H * 0.1, W, H * 0.6);
  sh.addColorStop(0, "rgba(255,255,255,0)");
  sh.addColorStop(0.45, `rgba(255,255,255,${light ? 0.45 : 0.18})`);
  sh.addColorStop(0.55, `rgba(255,255,255,${light ? 0.12 : 0.05})`);
  sh.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = sh;
  g.fillRect(0, 0, W, H);
  if (!crown) {
    // warm interior glow on some floors
    const floors = 40;
    for (let f = 0; f < floors; f++) {
      const v = Math.abs(Math.sin(f * 91.7) * 43758.5453) % 1;
      const y = (f / floors) * H;
      g.fillStyle = `rgba(255,${light ? 150 : 120},${light ? 100 : 70},${0.06 + v * (light ? 0.16 : 0.35)})`;
      g.fillRect(0, y + 6, W, H / floors - 12);
      g.fillStyle = light ? "rgba(95,60,48,0.42)" : "rgba(0,0,0,0.5)";
      g.fillRect(0, y, W, 2.5);
    }
  }
  // mullions
  for (let x = 0; x <= W; x += W / 10) {
    g.fillStyle = light ? "rgba(255,255,255,0.75)" : "rgba(255,220,200,0.12)";
    g.fillRect(x, 0, 2, H);
    g.fillStyle = light ? "rgba(80,52,44,0.38)" : "rgba(0,0,0,0.4)";
    g.fillRect(x + 2, 0, 1.5, H);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(4, 1); // one full panel per tower face
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function GhostTower({ position, h, w }: { position: [number, number, number]; h: number; w: number }) {
  return (
    <mesh position={[position[0], h / 2, position[2]]}>
      <boxGeometry args={[w, h, w * 0.8]} />
      <meshStandardMaterial color="#f3ece4" transparent opacity={0.28} roughness={0.2} metalness={0.2} depthWrite={false} />
      <Edges color="#C9A898" transparent opacity={0.55} />
    </mesh>
  );
}

function PifTower({ light }: { light: boolean }) {
  const reduce = useReducedMotion();
  const crownGlow = useRef<THREE.MeshBasicMaterial>(null);
  const PODIUM = 0.42;
  // [height, bottom half-width, top half-width, twist]
  const segs: [number, number, number, number][] = [
    [1.05, 0.74, 0.72, 0.0],
    [1.05, 0.72, 0.69, 0.045],
    [1.05, 0.69, 0.66, -0.015],
    [1.05, 0.66, 0.63, 0.05],
    [0.95, 0.63, 0.6, 0.0],
  ];
  const H = segs.reduce((a, x) => a + x[0], 0);
  const facade = useMemo(() => makeFacade(light), [light]);
  const crownTex = useMemo(() => makeFacade(light, true), [light]);
  const edge = light ? "#d8735a" : "#E8401C";

  useFrame(({ clock }) => {
    if (crownGlow.current && !reduce) crownGlow.current.opacity = 0.35 + 0.2 * Math.sin(clock.elapsedTime * 1.2);
  });

  let y0 = PODIUM;
  return (
    <group>
      {/* stone podium with glass band and a light line */}
      <mesh position={[0, PODIUM / 2, 0]}>
        <boxGeometry args={[2.3, PODIUM, 1.95]} />
        <meshStandardMaterial color={light ? "#e7ddd1" : "#3a302a"} roughness={0.7} />
      </mesh>
      <mesh position={[0, PODIUM * 0.55, 0]}>
        <boxGeometry args={[2.32, PODIUM * 0.42, 1.97]} />
        <meshStandardMaterial color={light ? "#5b4a43" : "#1d1714"} metalness={0.6} roughness={0.15} />
      </mesh>
      <mesh position={[0, PODIUM * 0.92, 0]}>
        <boxGeometry args={[2.34, 0.022, 1.99]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
      <mesh position={[-1.7, 0.3, 0.25]}>
        <boxGeometry args={[1.1, 0.11, 0.24]} />
        <meshStandardMaterial color={light ? "#e7ddd1" : "#3a302a"} roughness={0.6} />
      </mesh>

      {/* faceted curtain-wall shaft */}
      {segs.map(([h, rb, rt, tw], i) => {
        const y = y0 + h / 2;
        y0 += h;
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, Math.PI / 4 + tw, 0]}>
            <mesh>
              <cylinderGeometry args={[rt * Math.SQRT2, rb * Math.SQRT2, h, 4, 1, false]} />
              <meshStandardMaterial map={facade} emissive="#ffffff" emissiveMap={facade} emissiveIntensity={light ? 0.2 : 0.55} metalness={0.35} roughness={0.12} envMapIntensity={1.6} />
              <Edges color={edge} transparent opacity={0.55} />
            </mesh>
            {/* slim spandrel band at each fold */}
            <mesh position={[0, h / 2, 0]}>
              <cylinderGeometry args={[rt * Math.SQRT2 + 0.008, rt * Math.SQRT2 + 0.008, 0.018, 4, 1]} />
              <meshStandardMaterial color={light ? "#c39a88" : "#2a1f1b"} metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* crystalline crown */}
      <group position={[0, PODIUM + H, 0]}>
        <mesh position={[0.05, 0.95, 0]} rotation={[0.04, Math.PI / 4 + 0.05, -0.07]}>
          <cylinderGeometry args={[0.035, 0.6 * Math.SQRT2, 1.9, 4, 1]} />
          <meshStandardMaterial map={crownTex} emissive="#ffffff" emissiveMap={crownTex} emissiveIntensity={light ? 0.5 : 0.7} metalness={0.3} roughness={0.08} />
          <Edges color={C.cyan} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0.05, 0.9, 0]} rotation={[0.04, Math.PI / 4 + 0.05, -0.07]}>
          <cylinderGeometry args={[0.03, 0.52 * Math.SQRT2, 1.75, 4, 1, true]} />
          <meshBasicMaterial ref={crownGlow} color={C.cyan} transparent opacity={0.4} toneMapped={false} side={THREE.BackSide} />
        </mesh>
        {/* lower facet */}
        <mesh position={[-0.26, 0.42, 0.2]} rotation={[0.1, Math.PI / 4 - 0.2, 0.16]}>
          <cylinderGeometry args={[0.025, 0.38, 0.8, 4, 1]} />
          <meshStandardMaterial map={crownTex} emissive="#ffffff" emissiveMap={crownTex} emissiveIntensity={light ? 0.45 : 0.6} metalness={0.3} roughness={0.08} />
          <Edges color={C.cyan} transparent opacity={0.8} />
        </mesh>
        <Glow position={[0.1, 1.85, 0]} size={1.3} opacity={0.5} />
      </group>
    </group>
  );
}

/* ── Rooftop antenna emitting wireless rings ── */
function Antenna({ y }: { y: number }) {
  const rings = useRef<THREE.Mesh[]>([]);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rings.current.forEach((r, i) => {
      if (!r) return;
      const p = reduce ? 0.5 : ((t * 0.45 + i / 3) % 1);
      r.scale.setScalar(0.2 + p * 2.4);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.5;
    });
  });
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.012, 0.02, 0.7, 8]} />
        <meshStandardMaterial color="#D8C8BC" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
      <Glow position={[0, 0.72, 0]} size={0.5} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) rings.current[i] = m; }} position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.006, 6, 64]} />
          <meshBasicMaterial color={C.cyan} transparent opacity={0.4} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ── ESP32-style dev board (stylised, not cartoon) ── */
export function DevBoard({ scale = 1 }: { scale?: number }) {
  const pins = useMemo(() => Array.from({ length: 15 }, (_, i) => -0.42 + i * 0.06), []);
  return (
    <group scale={scale}>
      <RoundedBox args={[1, 0.035, 0.5]} radius={0.012} smoothness={3}>
        <meshStandardMaterial color="#1E1916" metalness={0.3} roughness={0.55} />
      </RoundedBox>
      {/* RF shield */}
      <mesh position={[0.22, 0.045, 0]}>
        <boxGeometry args={[0.36, 0.05, 0.3]} />
        <meshStandardMaterial color="#c7d3e6" metalness={1} roughness={0.22} />
      </mesh>
      {/* PCB antenna trace */}
      <mesh position={[0.45, 0.02, 0]}>
        <boxGeometry args={[0.07, 0.004, 0.3]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
      {/* USB + chips */}
      <mesh position={[-0.47, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.12]} />
        <meshStandardMaterial color="#9fb0c8" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 0.03, 0.06]}>
        <boxGeometry args={[0.12, 0.02, 0.12]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      {/* pin headers */}
      {pins.map((x) => (
        <group key={x}>
          <mesh position={[x, 0.03, 0.22]}>
            <boxGeometry args={[0.025, 0.03, 0.025]} />
            <meshStandardMaterial color="#d4a74a" metalness={1} roughness={0.3} />
          </mesh>
          <mesh position={[x, 0.03, -0.22]}>
            <boxGeometry args={[0.025, 0.03, 0.025]} />
            <meshStandardMaterial color="#d4a74a" metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.33, 0.025, -0.1]}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshBasicMaterial color={C.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Sensor node: faceted core + halo ── */
function SensorNode({ position, color = C.cyan }: { position: THREE.Vector3; color?: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.6;
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} metalness={0.4} roughness={0.2} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.004, 6, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <Glow size={0.55} color={color} opacity={0.6} />
    </group>
  );
}

/* ── Ground: platform + circuit pathways ── */
function Ground({ low, light }: { low: boolean; light: boolean }) {
  const traces = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    const n = low ? 10 : 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2;
      const r0 = 1.25;
      const r1 = 2.2 + (i % 3) * 0.5;
      const r2 = r1 + 0.8 + (i % 2) * 0.6;
      const p0 = new THREE.Vector3(Math.cos(a) * r0, 0.005, Math.sin(a) * r0);
      const p1 = new THREE.Vector3(Math.cos(a) * r1, 0.005, Math.sin(a) * r1);
      const a2 = a + (i % 2 ? 0.18 : -0.18);
      const p2 = new THREE.Vector3(Math.cos(a2) * r2, 0.005, Math.sin(a2) * r2);
      out.push([p0, p1, p2]);
    }
    return out;
  }, [low]);
  const curves = useMemo(() => traces.map((t) => new THREE.CatmullRomCurve3(t, false, "catmullrom", 0)), [traces]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[4.6, 96]} />
        <meshStandardMaterial color={light ? "#EDE6DB" : "#171310"} metalness={light ? 0.2 : 0.85} roughness={light ? 0.6 : 0.35} transparent opacity={0.92} />
      </mesh>
      <gridHelper args={[9.2, 36, light ? "#D8C6B6" : "#4A2E24", light ? "#E4D8CB" : "#2E211C"]} position={[0, 0.002, 0]} />
      {[1.3, 2.6, 4.2].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <ringGeometry args={[r, r + 0.012, 128]} />
          <meshBasicMaterial color={i === 0 ? C.cyan : C.neon} transparent opacity={0.45 - i * 0.1} toneMapped={false} />
        </mesh>
      ))}
      {traces.map((pts, i) => (
        <group key={i}>
          <Line points={pts} color="#C82909" lineWidth={1.2} transparent opacity={0.55} />
          <mesh position={pts[2]}>
            <circleGeometry args={[0.03, 12]} />
            <meshBasicMaterial color={C.cyan} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <DataPackets curves={curves} perCurve={1} speed={0.35} size={0.025} />
    </group>
  );
}

/* ── Main composition ── */
function Composition({ light }: { light: boolean }) {
  const low = useLowPower();
  const reduce = useReducedMotion();
  const group = useRef<THREE.Group>(null);
  const { viewport, pointer } = useThree();

  // Sensor nodes orbiting the tower, linked to anchor points on the facade.
  const { nodes, curves } = useMemo(() => {
    const n = low ? 7 : 11;
    const nodes: THREE.Vector3[] = [];
    const curves: THREE.Curve<THREE.Vector3>[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 2.4 + (i % 3) * 0.55;
      const p = new THREE.Vector3(Math.cos(a) * r, 0.6 + ((i * 7) % 5) * 0.55, Math.sin(a) * r);
      nodes.push(p);
      const anchor = new THREE.Vector3(Math.cos(a) * 0.85, 0.5 + ((i * 3) % 11) * 0.3, Math.sin(a) * 0.65);
      curves.push(arc(p, anchor, 0.25));
    }
    // a few node-to-node mesh links
    for (let i = 0; i < n; i += 2) curves.push(arc(nodes[i], nodes[(i + 3) % n], 0.4));
    return { nodes, curves };
  }, [low]);

  const linePts = useMemo(() => curves.map((c) => c.getPoints(32)), [curves]);
  // fit the taller CMA tower (≈7.6 units with spire) and the device halo into the canvas
  const fitScale = Math.min(1, viewport.width / 8.6, viewport.height / 8.4);

  useFrame((state, dt) => {
    if (!group.current) return;
    const tx = reduce ? 0 : pointer.x * 0.35;
    const ty = reduce ? 0 : -pointer.y * 0.08;
    const base = reduce ? 0 : state.clock.elapsedTime * 0.05;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, base + tx, 3, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, ty, 3, dt);
  });

  return (
    <group position={[0, -3.4 * fitScale, 0]} scale={fitScale}>
      <group ref={group}>
        <PifTower light={light} />
        {/* KAFD context — translucent "ghost" towers */}
        <GhostTower position={[-2.0, 0, -1.6]} h={3.4} w={1.0} />
        <GhostTower position={[2.1, 0, -1.7]} h={2.5} w={1.15} />
        <GhostTower position={[0.4, 0, -2.6]} h={4.4} w={0.9} />
        <Ground low={low} light={light} />


      </group>
      {/* smart-building devices in a fixed halo facing the viewer */}
      <HeroDevices />
      <DustField count={low ? 140 : 380} radius={6} height={6} />
    </group>
  );
}

/** Signals "ready" only after the scene has actually drawn a couple of frames. */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 2) {
      done.current = true;
      onReady?.();
    }
  });
  return null;
}

export default function HeroScene({ light = true, onReady }: { light?: boolean; onReady?: () => void }) {
  const low = useLowPower();
  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [5.8, 3.3, 8.6], fov: 40 }}
      fallback={<HeroFallback className="absolute inset-[8%] h-[84%] w-[84%]" />}
    >
      <fog attach="fog" args={[light ? "#F7F4EE" : "#141110", 12, 24]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} color="#FFE9DD" />
      <pointLight position={[0, 0.6, 0]} intensity={6} distance={6} color="#E8401C" />
      <pointLight position={[-4, 3, -2]} intensity={4} distance={10} color="#8E1C05" />
      {!low && (
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} color="#FFD9C7" position={[0, 5, -6]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#E8401C" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#8E1C05" position={[5, 3, 3]} scale={3} />
      </Environment>
      )}
      <Composition light={light} />
      <ReadySignal onReady={onReady} />
    </SceneCanvas>
  );
}
