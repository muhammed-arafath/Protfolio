"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Html, Lightformer, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { C, DataPackets, Glow, SceneCanvas, arc, useSceneHost } from "./common";
import { DevBoard } from "./HeroScene";
import { labDevices, labLinks, type LabDevice, type LabKind } from "@/content/lab";
import { useLowPower } from "@/lib/hooks";

/* ── Layout: stages left→right on a gentle curve, devices stacked in depth ── */
const STAGE_X = 2.05;
function layout(portrait: boolean) {
  const pos = new Map<string, THREE.Vector3>();
  const byStage = new Map<number, LabDevice[]>();
  labDevices.forEach((d) => byStage.set(d.stage, [...(byStage.get(d.stage) ?? []), d]));
  byStage.forEach((list, s) => {
    const cx = (s - 3) * STAGE_X;
    const cols = list.length > 3 ? 2 : 1;
    const rows = Math.ceil(list.length / cols);
    list.forEach((d, i) => {
      const col = cols === 2 ? i % 2 : 0;
      const row = cols === 2 ? Math.floor(i / 2) : i;
      if (portrait) {
        // stages run away from the camera (top → bottom on screen), devices spread sideways
        pos.set(d.id, new THREE.Vector3((row - (rows - 1) / 2) * 1.2, 0, cx + (cols === 2 ? (col - 0.5) * 0.9 : 0)));
      } else {
        const x = cx + (cols === 2 ? (col - 0.5) * 0.95 : 0);
        const z = (row - (rows - 1) / 2) * 1.3 - Math.pow(cx / 6, 2) * 1.6;
        pos.set(d.id, new THREE.Vector3(x, 0, z));
      }
    });
  });
  return pos;
}

const steel = { color: "#2A221E", metalness: 0.85, roughness: 0.3 } as const;
const shell = { color: "#e8eef8", metalness: 0.1, roughness: 0.45 } as const;

/* ── Device models (built from primitives, tuned for a clean industrial look) ── */
function Model({ kind, hot }: { kind: LabKind; hot: boolean }) {
  const glow = hot ? C.cyan : C.neon;
  const led = <meshBasicMaterial color={glow} toneMapped={false} />;
  switch (kind) {
    case "climate":
      return (
        <group position={[0, 0.2, 0]}>
          <RoundedBox args={[0.36, 0.3, 0.2]} radius={0.03}><meshStandardMaterial {...shell} /></RoundedBox>
          {[-0.08, 0, 0.08].map((y) => (
            <mesh key={y} position={[0, y, 0.101]}><boxGeometry args={[0.24, 0.025, 0.005]} /><meshStandardMaterial color="#8a97ab" /></mesh>
          ))}
          <mesh position={[0.13, 0.11, 0.105]}><sphereGeometry args={[0.012]} />{led}</mesh>
        </group>
      );
    case "pir":
      return (
        <group position={[0, 0.16, 0]}>
          <RoundedBox args={[0.34, 0.2, 0.34]} radius={0.03}><meshStandardMaterial {...shell} /></RoundedBox>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial color="#f4f7fb" roughness={0.25} transmission={0.4} thickness={0.2} transparent opacity={0.9} />
          </mesh>
        </group>
      );
    case "light":
      return (
        <group position={[0, 0.12, 0]}>
          <mesh><cylinderGeometry args={[0.16, 0.18, 0.12, 32]} /><meshStandardMaterial {...shell} /></mesh>
          <mesh position={[0, 0.065, 0]}><cylinderGeometry args={[0.07, 0.07, 0.01, 24]} /><meshStandardMaterial color="#3b2a10" emissive="#ffb648" emissiveIntensity={hot ? 1.2 : 0.4} /></mesh>
        </group>
      );
    case "air":
      return (
        <group position={[0, 0.22, 0]}>
          <RoundedBox args={[0.4, 0.34, 0.16]} radius={0.03}><meshStandardMaterial {...shell} /></RoundedBox>
          <mesh position={[0, 0.03, 0.081]}><planeGeometry args={[0.28, 0.14]} /><meshBasicMaterial color="#1C1210" /></mesh>
          <mesh position={[0, 0.03, 0.082]}><planeGeometry args={[0.2, 0.05]} /><meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.8} /></mesh>
        </group>
      );
    case "meter":
      return (
        <group position={[0, 0.28, 0]}>
          <RoundedBox args={[0.34, 0.46, 0.22]} radius={0.02}><meshStandardMaterial color="#d9e0ea" roughness={0.5} /></RoundedBox>
          <mesh position={[0, 0.08, 0.111]}><planeGeometry args={[0.24, 0.11]} /><meshBasicMaterial color="#0a3b2c" /></mesh>
          <mesh position={[0, 0.08, 0.112]}><planeGeometry args={[0.18, 0.04]} /><meshBasicMaterial color="#4dffb8" toneMapped={false} /></mesh>
          {[-0.09, 0, 0.09].map((x) => (
            <mesh key={x} position={[x, -0.17, 0.111]}><boxGeometry args={[0.05, 0.05, 0.01]} /><meshStandardMaterial color="#6b7891" metalness={0.6} /></mesh>
          ))}
        </group>
      );
    case "ir":
      return (
        <group position={[0, 0.1, 0]}>
          <mesh><cylinderGeometry args={[0.2, 0.22, 0.1, 40]} /><meshStandardMaterial color="#1A1512" metalness={0.4} roughness={0.15} /></mesh>
          <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.15, 0.165, 48]} />{led}</mesh>
        </group>
      );
    case "board":
      return <group position={[0, 0.08, 0]} scale={0.62}><DevBoard /></group>;
    case "module":
      return (
        <group position={[0, 0.06, 0]}>
          <mesh><boxGeometry args={[0.3, 0.025, 0.36]} /><meshStandardMaterial color="#1E1916" roughness={0.5} /></mesh>
          <mesh position={[0, 0.03, 0.03]}><boxGeometry args={[0.24, 0.035, 0.22]} /><meshStandardMaterial color="#c7d3e6" metalness={1} roughness={0.25} /></mesh>
          <mesh position={[0, 0.015, -0.15]}><boxGeometry args={[0.24, 0.004, 0.04]} />{led}</mesh>
        </group>
      );
    case "relay":
      return (
        <group position={[0, 0.15, 0]}>
          <RoundedBox args={[0.24, 0.3, 0.36]} radius={0.02}><meshStandardMaterial color="#2a3b5c" roughness={0.5} /></RoundedBox>
          {[-0.1, 0.1].map((z) => (
            <mesh key={z} position={[0, 0.16, z]}><boxGeometry args={[0.18, 0.04, 0.08]} /><meshStandardMaterial color="#1a8f5a" /></mesh>
          ))}
          <mesh position={[0.121, 0.06, 0]}><sphereGeometry args={[0.016]} />{led}</mesh>
        </group>
      );
    case "router":
      return (
        <group position={[0, 0.1, 0]}>
          <RoundedBox args={[0.9, 0.09, 0.55]} radius={0.03}><meshStandardMaterial {...steel} /></RoundedBox>
          {[-0.3, 0, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.3, -0.24]} rotation={[0.08, 0, 0]}><cylinderGeometry args={[0.018, 0.022, 0.55, 10]} /><meshStandardMaterial color="#1E1916" /></mesh>
          ))}
          {[-0.3, -0.2, -0.1, 0, 0.1].map((x) => (
            <mesh key={x} position={[x, 0.047, 0.2]}><boxGeometry args={[0.03, 0.004, 0.015]} />{led}</mesh>
          ))}
        </group>
      );
    case "rack":
      return (
        <group position={[0, 0.6, 0]}>
          <mesh><boxGeometry args={[0.6, 1.2, 0.6]} /><meshStandardMaterial {...steel} /><Edges color="#8A3A26" transparent opacity={0.6} /></mesh>
          {[0.42, 0.24, 0.06, -0.12, -0.3].map((y) => (
            <group key={y} position={[0, y, 0.301]}>
              <mesh><planeGeometry args={[0.5, 0.12]} /><meshStandardMaterial color="#1C1714" metalness={0.6} roughness={0.4} /></mesh>
              <mesh position={[0.19, 0, 0.002]}><planeGeometry args={[0.04, 0.02]} />{led}</mesh>
              <mesh position={[0.12, 0, 0.002]}><planeGeometry args={[0.04, 0.02]} /><meshBasicMaterial color="#4dffb8" toneMapped={false} /></mesh>
            </group>
          ))}
        </group>
      );
    case "hub":
      return (
        <group position={[0, 0.22, 0]}>
          <RoundedBox args={[0.5, 0.34, 0.5]} radius={0.08} smoothness={4}><meshStandardMaterial color="#f0f4fa" roughness={0.35} /></RoundedBox>
          <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.1, 0.12, 6]} />{led}</mesh>
        </group>
      );
    case "flow":
      return (
        <group position={[0, 0.3, 0]}>
          {[[-0.22, 0.12], [0.22, 0.2], [0.0, -0.12], [0.26, -0.18]].map(([x, y], i) => (
            <RoundedBox key={i} args={[0.26, 0.11, 0.08]} radius={0.02} position={[x, y, 0]}>
              <meshStandardMaterial color={i % 2 ? "#8f2f2f" : "#2f5a8f"} emissive={i % 2 ? "#ff5a4a" : "#E8401C"} emissiveIntensity={hot ? 0.8 : 0.35} roughness={0.4} />
            </RoundedBox>
          ))}
          <Line points={[[-0.09, 0.12, 0], [0.09, 0.2, 0]]} color="#CDBDB0" lineWidth={1.5} />
          <Line points={[[-0.22, 0.07, 0], [0, -0.07, 0]]} color="#CDBDB0" lineWidth={1.5} />
          <Line points={[[0.13, -0.12, 0], [0.26, -0.18, 0]]} color="#CDBDB0" lineWidth={1.5} />
        </group>
      );
    case "cloud":
      return (
        <group position={[0, 0.42, 0]}>
          <mesh><icosahedronGeometry args={[0.26, 1]} /><meshStandardMaterial color="#2E201B" metalness={0.7} roughness={0.25} transparent opacity={0.85} /></mesh>
          <mesh><icosahedronGeometry args={[0.3, 1]} /><meshBasicMaterial color={glow} wireframe transparent opacity={0.45} toneMapped={false} /></mesh>
        </group>
      );
    case "db":
      return (
        <group position={[0, 0.12, 0]}>
          {[0, 0.2, 0.4].map((y) => (
            <group key={y} position={[0, y, 0]}>
              <mesh><cylinderGeometry args={[0.28, 0.28, 0.16, 40]} /><meshStandardMaterial {...steel} /></mesh>
              <mesh position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.24, 0.255, 48]} />{led}</mesh>
            </group>
          ))}
        </group>
      );
    case "screen":
      return (
        <group position={[0, 0.55, 0]}>
          <RoundedBox args={[1.1, 0.68, 0.05]} radius={0.02}><meshStandardMaterial color="#171310" metalness={0.6} roughness={0.3} /></RoundedBox>
          <mesh position={[0, 0, 0.027]}><planeGeometry args={[1.02, 0.6]} /><meshBasicMaterial color="#1C1714" /></mesh>
          {[0.3, 0.55, 0.42, 0.7, 0.5, 0.82, 0.62].map((h, i) => (
            <mesh key={i} position={[-0.36 + i * 0.12, -0.26 + (h * 0.4) / 2, 0.03]}>
              <planeGeometry args={[0.07, h * 0.4]} />
              <meshBasicMaterial color={i % 2 ? C.cyan : C.neon} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          ))}
          <mesh position={[0, -0.5, -0.05]}><boxGeometry args={[0.06, 0.32, 0.06]} /><meshStandardMaterial {...steel} /></mesh>
        </group>
      );
  }
}

function Device({ d, pos, selected, dimmed, highlight, onSelect, showLabel }: {
  d: LabDevice; pos: THREE.Vector3; selected: boolean; dimmed: boolean; highlight: boolean; onSelect: (id: string) => void; showLabel: boolean;
}) {
  const [hover, setHover] = useState(false);
  const host = useSceneHost();
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const grp = useRef<THREE.Group>(null);
  const hot = selected || hover || highlight;

  useFrame(({ clock }, dt) => {
    if (ring.current) ring.current.opacity = THREE.MathUtils.damp(ring.current.opacity, hot ? 0.95 : dimmed ? 0.12 : 0.35, 6, dt);
    if (grp.current) grp.current.position.y = THREE.MathUtils.damp(grp.current.position.y, selected ? 0.12 + Math.sin(clock.elapsedTime * 2) * 0.02 : 0, 5, dt);
  });

  return (
    <group position={pos}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect(d.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        {/* pedestal */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.08, 6]} />
          <meshStandardMaterial color="#1E1916" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.44, 0.48, 6]} />
          <meshBasicMaterial ref={ring} color={C.cyan} transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <group ref={grp}><Model kind={d.kind} hot={hot} /></group>
        {/* larger invisible hit area for easier selection on touch */}
        <mesh position={[0, 0.4, 0]} visible={false}><boxGeometry args={[0.9, 0.9, 0.9]} /></mesh>
      </group>
      {hot && <Glow position={[0, 0.05, 0]} size={1.6} opacity={0.35} />}
      {showLabel && (
        <Html portal={host} position={[0, -0.12, 0.62]} center distanceFactor={7} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className={`whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[11px] tracking-wide backdrop-blur transition-colors ${hot ? "border-cyan/60 bg-[#1C1210]/90 text-[#E8401C]" : "border-white/10 bg-[#141110]/70 text-[#B0A599]"} ${dimmed && !hot ? "opacity-40" : ""}`}>
            {d.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function Rig({ target, center, fit }: { target: THREE.Vector3 | null; center: THREE.Vector3; fit: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const low = useLowPower();
  const focusUntil = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Glide to the selection (or back to the overview) for ~1.4 s, then hand control back to the user.
  useEffect(() => {
    focusUntil.current = performance.now() + 1400;
  }, [target, center, fit]);

  useFrame(({ camera }, dt) => {
    const c = controls.current;
    if (!c) return;
    const g = target ? tmp.copy(target).setY(0.45) : center;
    if (performance.now() < focusUntil.current) {
      c.target.x = THREE.MathUtils.damp(c.target.x, g.x, 4, dt);
      c.target.y = THREE.MathUtils.damp(c.target.y, g.y, 4, dt);
      c.target.z = THREE.MathUtils.damp(c.target.z, g.z, 4, dt);
      const want = target ? (low ? 7 : 5.2) : fit;
      const dir = camera.position.clone().sub(c.target);
      dir.setLength(THREE.MathUtils.damp(dir.length(), want, 3, dt));
      camera.position.copy(c.target).add(dir);
    }
    c.update();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[center.x, center.y, center.z]}
      enablePan={false}
      enableDamping
      minDistance={3.5}
      maxDistance={Math.max(16, fit * 1.4)}
      minPolarAngle={0.35}
      maxPolarAngle={1.3}
      minAzimuthAngle={-1.1}
      maxAzimuthAngle={1.1}
    />
  );
}

type LabProps = { selected: string | null; onSelect: (id: string | null) => void; activeStage: number | null };

function LabContent({ selected, onSelect, activeStage }: LabProps) {
  const low = useLowPower();
  const { size } = useThree();
  const portrait = size.height > size.width * 1.05;
  const pos = useMemo(() => layout(portrait), [portrait]);
  const stageOf = useMemo(() => new Map(labDevices.map((d) => [d.id, d.stage])), []);

  // Fit the whole lab into the canvas, whatever its shape.
  const { center, fit } = useMemo(() => {
    const box = new THREE.Box3();
    pos.forEach((p) => box.expandByPoint(p));
    const c = box.getCenter(new THREE.Vector3()).setY(0.3);
    const w = box.max.x - box.min.x + 1.8;
    const d = box.max.z - box.min.z + 1.8;
    const t = Math.tan(THREE.MathUtils.degToRad(45 / 2));
    const aspect = size.width / Math.max(1, size.height);
    const f = Math.max(w / 2 / (t * aspect), (d * 0.62 + 1.6) / 2 / t) * 1.02;
    return { center: c, fit: f };
  }, [pos, size.width, size.height]);

  const links = useMemo(
    () => labLinks.map(([a, b]) => ({ a, b, curve: arc(pos.get(a)!.clone().setY(0.25), pos.get(b)!.clone().setY(0.25), 0.55) })),
    [pos]
  );
  const curves = useMemo(() => links.map((l) => l.curve), [links]);
  const linePts = useMemo(() => curves.map((c) => c.getPoints(36)), [curves]);

  const linkHot = (i: number) => {
    const l = links[i];
    if (selected) return l.a === selected || l.b === selected;
    if (activeStage !== null) return stageOf.get(l.a) === activeStage;
    return false;
  };
  const anyFocus = selected !== null || activeStage !== null;
  const linkScale = useRef<(i: number) => number>(() => 1);
  linkScale.current = (i) => (linkHot(i) ? 1.8 : anyFocus ? 0.45 : 1);

  return (
    <>
      <color attach="background" args={["#141110"]} />
      <fog attach="fog" args={["#141110", fit * 1.3, fit * 2.6]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 9, 6]} intensity={1.3} color="#FFF0E6" />
      <pointLight position={[-6, 3, 1]} intensity={4} distance={10} color="#C82909" />
      <pointLight position={[6, 2, 1]} intensity={8} distance={12} color="#E8401C" />
      {!low && (
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color="#FFE4D6" position={[0, 6, -5]} scale={[14, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#E8401C" position={[0, 2, 8]} scale={[10, 1, 1]} />
      </Environment>
      )}

      {/* lab floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#171310" metalness={0.45} roughness={0.6} />
      </mesh>
      <gridHelper args={[40, 80, "#4A2E24", "#2E211C"]} position={[0, -0.085, 0]} />

      {linePts.map((pts, i) => (
        <Line key={`${portrait}-${i}`} points={pts} color={linkHot(i) ? "#E8401C" : "#C82909"} lineWidth={linkHot(i) ? 2 : 1} transparent opacity={linkHot(i) ? 0.9 : anyFocus ? 0.12 : 0.38} />
      ))}
      <DataPackets key={String(portrait)} curves={curves} perCurve={low ? 2 : 3} speed={0.32} size={0.05} scaleFor={(i) => linkScale.current(i)} />

      {labDevices.map((d) => {
        const isSel = selected === d.id;
        const inStage = activeStage !== null && d.stage === activeStage;
        const related = selected ? labLinks.some(([a, b]) => (a === selected && b === d.id) || (b === selected && a === d.id)) : false;
        return (
          <Device
            key={d.id}
            d={d}
            pos={pos.get(d.id)!}
            selected={isSel}
            highlight={inStage || related}
            dimmed={anyFocus && !isSel && !inStage && !related}
            onSelect={(id) => onSelect(id === selected ? null : id)}
            showLabel={!low || isSel || inStage}
          />
        );
      })}

      <Rig target={selected ? pos.get(selected)! : null} center={center} fit={fit} />
    </>
  );
}

export default function LabScene(props: LabProps) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 6, 13], fov: 45 }} onPointerMissed={() => props.onSelect(null)}>
      <LabContent {...props} />
    </SceneCanvas>
  );
}
