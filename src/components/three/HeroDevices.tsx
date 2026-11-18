"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Float, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { C, DataPackets, Glow, arc } from "./common";
import { useReducedMotion } from "@/lib/hooks";

/* ── canvas-texture helper (labels drawn locally, no font files) ── */
function useTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, key = "") {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, key]);
}

const WHITE = "#F3EFE9";
const SHELL = { color: WHITE, roughness: 0.5 } as const;
const BRAND = "#C82909";

function Blink({ color, position, r = 0.02, speed = 3, phase = 0 }: { color: string; position: [number, number, number]; r?: number; speed?: number; phase?: number }) {
  const m = useRef<THREE.MeshBasicMaterial>(null);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (!m.current) return;
    m.current.opacity = reduce ? 1 : Math.sin(clock.elapsedTime * speed + phase) > 0.2 ? 1 : 0.25;
  });
  return (
    <mesh position={position}>
      <circleGeometry args={[r, 14]} />
      <meshBasicMaterial ref={m} color={color} transparent toneMapped={false} />
    </mesh>
  );
}

/* ───────── Devices ───────── */

/** IR sensor / IR blaster for AC & TV control. */
function IrSensor() {
  const wave = useRef<THREE.Mesh>(null);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (!wave.current) return;
    const p = reduce ? 0.4 : (clock.elapsedTime * 0.8) % 1;
    wave.current.scale.setScalar(0.4 + p * 1.8);
    (wave.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.6;
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.3, 0.16, 40]} /><meshStandardMaterial color="#1C1917" metalness={0.3} roughness={0.2} /></mesh>
      <mesh position={[0, 0, 0.081]}><circleGeometry args={[0.24, 40]} /><meshStandardMaterial color="#2a2320" metalness={0.4} roughness={0.12} /></mesh>
      <mesh position={[0, 0, 0.083]}><ringGeometry args={[0.18, 0.2, 48]} /><meshBasicMaterial color="#b46bff" toneMapped={false} /></mesh>
      <mesh ref={wave} position={[0, 0, 0.09]}><ringGeometry args={[0.2, 0.215, 48]} /><meshBasicMaterial color="#b46bff" transparent opacity={0.5} toneMapped={false} /></mesh>
    </group>
  );
}

/** 5-in-1 air quality sensor with a live-style display. */
function AirQuality() {
  const lcd = useTex(240, 150, (g) => {
    g.fillStyle = "#141110"; g.fillRect(0, 0, 240, 150);
    g.fillStyle = "#E8401C"; g.font = "bold 54px Inter, Arial"; g.fillText("368", 16, 66);
    g.fillStyle = "#B0A599"; g.font = "16px Inter, Arial"; g.fillText("CO₂ ppm", 140, 40);
    g.fillStyle = "#3dff8a"; g.font = "bold 16px Inter, Arial"; g.fillText("GOOD", 140, 64);
    g.fillStyle = "#F7F4EE"; g.font = "18px Inter, Arial"; g.fillText("24.1°C   31.9%", 16, 110);
    g.fillStyle = "#B0A599"; g.font = "14px Inter, Arial"; g.fillText("VOC 1 · CH₂O 2", 16, 136);
  });
  return (
    <group>
      <RoundedBox args={[0.72, 0.62, 0.2]} radius={0.06} smoothness={3}><meshStandardMaterial {...SHELL} /></RoundedBox>
      <mesh position={[0, 0.05, 0.101]}><planeGeometry args={[0.56, 0.35]} /><meshBasicMaterial map={lcd} toneMapped={false} /></mesh>
      {[-0.2, -0.1, 0, 0.1, 0.2].map((x) => (
        <mesh key={x} position={[x, -0.22, 0.101]}><planeGeometry args={[0.05, 0.02]} /><meshStandardMaterial color="#9aa3ae" /></mesh>
      ))}
    </group>
  );
}

/** Magnetic door contact (open / closed). */
function DoorSensor() {
  const mag = useRef<THREE.Group>(null);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (!mag.current) return;
    const open = !reduce && Math.sin(clock.elapsedTime * 0.8) > 0.4;
    mag.current.position.x = THREE.MathUtils.lerp(mag.current.position.x, open ? 0.34 : 0.17, 0.1);
  });
  return (
    <group>
      <RoundedBox args={[0.2, 0.6, 0.12]} radius={0.03} position={[-0.08, 0, 0]}><meshStandardMaterial {...SHELL} /></RoundedBox>
      <group ref={mag} position={[0.17, 0, 0]}>
        <RoundedBox args={[0.11, 0.42, 0.1]} radius={0.025}><meshStandardMaterial {...SHELL} /></RoundedBox>
      </group>
      <Blink color={BRAND} position={[-0.08, 0.2, 0.061]} />
    </group>
  );
}

/** Ceiling PIR motion / presence sensor. */
function PirSensor() {
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => ring.current && (ring.current.opacity = 0.35 + 0.35 * Math.sin(clock.elapsedTime * 2.5)));
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.32, 0.07, 40]} /><meshStandardMaterial {...SHELL} /></mesh>
      <mesh position={[0, 0, 0.035]}><sphereGeometry args={[0.19, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#fbfaf7" roughness={0.25} transparent opacity={0.92} /></mesh>
      <mesh position={[0, 0, 0.04]}><ringGeometry args={[0.215, 0.25, 48]} /><meshBasicMaterial ref={ring} color={C.cyan} transparent opacity={0.4} toneMapped={false} /></mesh>
    </group>
  );
}

/** Video intercom outdoor panel: camera, speaker grille, call button. */
function Intercom() {
  return (
    <group>
      <RoundedBox args={[0.42, 0.82, 0.1]} radius={0.04} smoothness={3}><meshStandardMaterial color="#2A221E" metalness={0.6} roughness={0.3} /></RoundedBox>
      <mesh position={[0, 0.26, 0.051]}><circleGeometry args={[0.08, 24]} /><meshStandardMaterial color="#0d0b0a" metalness={0.6} roughness={0.1} /></mesh>
      <mesh position={[0, 0.26, 0.052]}><circleGeometry args={[0.035, 20]} /><meshStandardMaterial color="#3a4b66" metalness={0.8} roughness={0.05} /></mesh>
      <Blink color="#3dff8a" position={[0.11, 0.34, 0.052]} r={0.012} speed={2} />
      {[-0.08, -0.04, 0, 0.04, 0.08].map((y) => (
        <mesh key={y} position={[0, 0.02 + y * 0.6, 0.052]}><planeGeometry args={[0.2, 0.012]} /><meshBasicMaterial color="#5a4c45" /></mesh>
      ))}
      <mesh position={[0, -0.24, 0.052]}><circleGeometry args={[0.07, 24]} /><meshStandardMaterial color="#d8d2ca" metalness={0.8} roughness={0.25} /></mesh>
      <mesh position={[0, -0.24, 0.054]}><ringGeometry args={[0.075, 0.09, 32]} /><meshBasicMaterial color={BRAND} toneMapped={false} /></mesh>
    </group>
  );
}

/** Ceiling Wi-Fi access point with status ring. */
function AccessPoint() {
  const waves = useRef<THREE.Mesh[]>([]);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    waves.current.forEach((w, i) => {
      if (!w) return;
      const p = reduce ? 0.5 : ((clock.elapsedTime * 0.5 + i / 3) % 1);
      w.scale.setScalar(0.5 + p * 1.6);
      (w.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.45;
    });
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.36, 0.38, 0.08, 48]} /><meshStandardMaterial {...SHELL} /></mesh>
      <mesh position={[0, 0, 0.041]}><ringGeometry args={[0.1, 0.13, 48]} /><meshBasicMaterial color={C.cyan} toneMapped={false} /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { if (m) waves.current[i] = m; }} position={[0, 0, 0.05]}>
          <ringGeometry args={[0.36, 0.372, 64]} />
          <meshBasicMaterial color={C.cyan} transparent opacity={0.3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Smart light bulb (warm glow). */
function Light() {
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const reduce = useReducedMotion();
  useFrame(({ clock }) => {
    if (glow.current) glow.current.emissiveIntensity = reduce ? 1.6 : 1.3 + 0.5 * Math.sin(clock.elapsedTime * 1.2);
  });
  return (
    <group>
      <mesh position={[0, 0.06, 0]}><sphereGeometry args={[0.24, 32, 32]} /><meshStandardMaterial ref={glow} color="#fff3d6" emissive="#ffb648" emissiveIntensity={1.5} roughness={0.2} toneMapped={false} /></mesh>
      <mesh position={[0, -0.24, 0]}><cylinderGeometry args={[0.11, 0.13, 0.16, 24]} /><meshStandardMaterial color="#c9c2b8" metalness={0.8} roughness={0.3} /></mesh>
      {[-0.29, -0.33].map((y) => (
        <mesh key={y} position={[0, y, 0]}><torusGeometry args={[0.11, 0.012, 8, 24]} /><meshStandardMaterial color="#a39b90" metalness={0.9} roughness={0.3} /></mesh>
      ))}
      <Glow size={1.3} color="#ffb648" opacity={0.75} position={[0, 0.06, 0]} />
    </group>
  );
}

/** Smart wall switch (2 gang) with indicator LEDs. */
function Switch() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.62, 0.08]} radius={0.05} smoothness={3}><meshPhysicalMaterial color="#1C1917" metalness={0.3} roughness={0.08} clearcoat={1} /></RoundedBox>
      {[-0.13, 0.13].map((x, i) => (
        <group key={x} position={[x, 0, 0.041]}>
          <mesh><planeGeometry args={[0.22, 0.46]} /><meshStandardMaterial color="#2a2320" roughness={0.2} /></mesh>
          <mesh position={[0, 0.16, 0.001]}><circleGeometry args={[0.018, 12]} /><meshBasicMaterial color={i === 0 ? BRAND : "#5a4c45"} toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
}

/** Smart door lock with keypad and handle. */
function SmartLock() {
  const pad = useTex(120, 220, (g) => {
    g.fillStyle = "#141110"; g.fillRect(0, 0, 120, 220);
    g.fillStyle = "#E8401C"; g.font = "bold 20px Inter, Arial"; g.textAlign = "center";
    "123456789*0#".split("").forEach((k, i) => g.fillText(k, 22 + (i % 3) * 38, 36 + Math.floor(i / 3) * 50));
  });
  return (
    <group>
      <RoundedBox args={[0.34, 0.86, 0.12]} radius={0.05} smoothness={3}><meshStandardMaterial color="#2A221E" metalness={0.7} roughness={0.25} /></RoundedBox>
      <mesh position={[0, 0.12, 0.061]}><planeGeometry args={[0.24, 0.44]} /><meshBasicMaterial map={pad} toneMapped={false} /></mesh>
      <mesh position={[0, -0.28, 0.065]}><circleGeometry args={[0.05, 24]} /><meshStandardMaterial color="#d8d2ca" metalness={0.9} roughness={0.2} /></mesh>
      {/* lever handle */}
      <mesh position={[0.09, -0.28, 0.12]} rotation={[0, 0, 0]}><boxGeometry args={[0.32, 0.05, 0.05]} /><meshStandardMaterial color="#d8d2ca" metalness={0.9} roughness={0.2} /></mesh>
      <Blink color="#3dff8a" position={[0, 0.4, 0.061]} r={0.014} speed={1.5} />
    </group>
  );
}

/* ───────── BMS head-end equipment ───────── */

/** BMS controller cabinet: DIN-rail modules behind a glass door. */
function BmsCabinet() {
  const mods = useMemo(() => Array.from({ length: 6 }, (_, i) => -0.27 + i * 0.108), []);
  return (
    <group>
      <RoundedBox args={[0.8, 1.05, 0.34]} radius={0.03} smoothness={2}><meshStandardMaterial color="#D9D2C8" metalness={0.3} roughness={0.45} /></RoundedBox>
      <mesh position={[0, 0, 0.171]}><planeGeometry args={[0.68, 0.92]} /><meshStandardMaterial color="#1C1714" roughness={0.3} /></mesh>
      {[0.22, -0.18].map((y) => (
        <group key={y} position={[0, y, 0.175]}>
          <mesh><planeGeometry args={[0.64, 0.05]} /><meshStandardMaterial color="#9aa3ae" metalness={0.9} roughness={0.3} /></mesh>
          {mods.map((x, i) => (
            <group key={x} position={[x, 0, 0.012]}>
              <mesh><boxGeometry args={[0.095, 0.26, 0.03]} /><meshStandardMaterial color="#eeeae4" roughness={0.5} /></mesh>
              <Blink color={i % 3 === 0 ? "#3dff8a" : BRAND} position={[0.025, 0.09, 0.017]} r={0.01} speed={2 + i * 0.4} phase={i} />
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0.33, 0, 0.18]}><boxGeometry args={[0.02, 0.14, 0.02]} /><meshStandardMaterial color="#6B625A" metalness={0.8} /></mesh>
    </group>
  );
}

/** PALM head-end: server rack with status LEDs. */
function ServerRack() {
  return (
    <group>
      <RoundedBox args={[0.6, 1.25, 0.5]} radius={0.03} smoothness={2}><meshStandardMaterial color="#1C1714" metalness={0.6} roughness={0.3} /></RoundedBox>
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i} position={[0, 0.46 - i * 0.15, 0.251]}>
          <mesh><planeGeometry args={[0.5, 0.11]} /><meshStandardMaterial color="#2A221E" metalness={0.5} roughness={0.4} /></mesh>
          <Blink color={i % 2 ? "#3dff8a" : C.cyan.getStyle()} position={[0.19, 0, 0.002]} r={0.012} speed={3 + i * 0.5} phase={i * 0.7} />
          <Blink color={C.cyan.getStyle()} position={[0.15, 0, 0.002]} r={0.012} speed={2 + i * 0.3} phase={i} />
          <mesh position={[-0.1, 0, 0.002]}><planeGeometry args={[0.24, 0.02]} /><meshBasicMaterial color="#4A3A33" /></mesh>
        </group>
      ))}
    </group>
  );
}

/** Monitoring dashboard screen (BMS front-end). */
function Dashboard() {
  const screen = useTex(420, 260, (g) => {
    g.fillStyle = "#141110"; g.fillRect(0, 0, 420, 260);
    g.fillStyle = "#E8401C"; g.font = "bold 20px Inter, Arial"; g.fillText("PALM", 18, 32);
    g.fillStyle = "#B0A599"; g.font = "13px Inter, Arial"; g.fillText("BMS · LIVE", 84, 31);
    const bars = [0.4, 0.62, 0.5, 0.78, 0.58, 0.85, 0.66, 0.72, 0.9];
    bars.forEach((v, i) => { g.fillStyle = i % 2 ? "#E8401C" : "#8E1C05"; g.fillRect(20 + i * 22, 210 - v * 140, 14, v * 140); });
    g.strokeStyle = "#ffb648"; g.lineWidth = 3; g.beginPath();
    [0.5, 0.42, 0.6, 0.55, 0.7, 0.62, 0.78].forEach((v, i) => (i ? g.lineTo(240 + i * 26, 210 - v * 140) : g.moveTo(240, 210 - v * 140)));
    g.stroke();
    g.fillStyle = "#2E221D"; g.fillRect(240, 40, 160, 44);
    g.fillStyle = "#F7F4EE"; g.font = "bold 24px Inter, Arial"; g.fillText("24°C · 368", 250, 71);
  });
  return (
    <group>
      <RoundedBox args={[1.05, 0.68, 0.05]} radius={0.02}><meshStandardMaterial color="#141110" metalness={0.5} roughness={0.3} /></RoundedBox>
      <mesh position={[0, 0, 0.027]}><planeGeometry args={[0.98, 0.6]} /><meshBasicMaterial map={screen} toneMapped={false} /></mesh>
      <mesh position={[0, -0.47, -0.04]}><boxGeometry args={[0.06, 0.28, 0.06]} /><meshStandardMaterial color="#2A221E" metalness={0.8} /></mesh>
      <mesh position={[0, -0.61, -0.04]}><boxGeometry args={[0.34, 0.03, 0.2]} /><meshStandardMaterial color="#2A221E" metalness={0.8} /></mesh>
    </group>
  );
}

/* ───────── System model ───────── */

const FIELD = [
  { key: "pir", el: <PirSensor /> },
  { key: "air", el: <AirQuality /> },
  { key: "ir", el: <IrSensor /> },
  { key: "door", el: <DoorSensor /> },
  { key: "lock", el: <SmartLock /> },
  { key: "intercom", el: <Intercom /> },
  { key: "ap", el: <AccessPoint /> },
  { key: "light", el: <Light /> },
  { key: "switch", el: <Switch /> },
];

/** Polyline → curve, so packets can follow cable routes with corners. */
function route(points: THREE.Vector3[]) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 1; i < points.length; i++) path.add(new THREE.LineCurve3(points[i - 1], points[i]));
  return path;
}

/**
 * IoT / BMS system model around the tower: field devices mounted on the floors → risers →
 * BMS controller at the base → network → PALM head-end → monitoring dashboard.
 * Laid out in the (fixed) camera's screen plane, so the system reads clearly while the tower turns.
 */
export function HeroDevices() {
  const model = useMemo(() => {
    const right = new THREE.Vector3(8.6, 0, -5.8).normalize();
    const fwd = new THREE.Vector3(5.8, 0, 8.6).normalize();
    const at = (x: number, y: number, z = 1.0) => right.clone().multiplyScalar(x).add(new THREE.Vector3(0, y, 0)).add(fwd.clone().multiplyScalar(z));

    // field devices: 5 on the left façade, 4 on the right, at floor levels
    const left = [1.35, 2.35, 3.35, 4.35, 5.3];
    const rightY = [1.6, 2.6, 3.6, 4.6];
    const devX = 1.45;
    const riserX = 1.0;
    const field = FIELD.map((d, i) => {
      const isLeft = i < 5;
      const y = isLeft ? left[i] : rightY[i - 5];
      const sx = isLeft ? -devX : devX;
      return { ...d, pos: at(sx, y), y, side: isLeft ? -1 : 1 };
    });

    // head-end at the base
    const cabinet = at(-2.15, 0.55, 1.6);
    const rack = at(2.05, 0.62, 1.6);
    const screen = at(2.05, 1.85, 1.6);

    const cables: THREE.Vector3[][] = [];
    const flows: THREE.Curve<THREE.Vector3>[] = [];
    // device → riser → down to the base → BMS controller cabinet
    field.forEach((f) => {
      const rx = f.side * riserX;
      const pts = [f.pos, at(rx, f.y), at(rx, 0.12), at(f.side < 0 ? -2.15 : -0.3, 0.12, 1.35), cabinet.clone().add(new THREE.Vector3(0, -0.3, 0))];
      cables.push(pts.slice(0, 2));
      flows.push(route(pts));
    });
    // risers (one per side)
    cables.push([at(-riserX, 5.3), at(-riserX, 0.12)], [at(riserX, 4.6), at(riserX, 0.12)]);
    // BMS controller → PALM server (network trunk in front of the podium) → dashboard
    const trunk = [cabinet.clone().add(new THREE.Vector3(0, -0.45, 0)), at(-2.15, 0.06, 2.0), at(2.05, 0.06, 2.0), rack.clone().add(new THREE.Vector3(0, -0.55, 0))];
    cables.push(trunk);
    flows.push(route(trunk), route(trunk), route([rack.clone().add(new THREE.Vector3(0, 0.6, 0)), screen.clone().add(new THREE.Vector3(0, -0.45, 0))]));
    cables.push([rack.clone().add(new THREE.Vector3(0, 0.6, 0)), screen.clone().add(new THREE.Vector3(0, -0.45, 0))]);
    // ground return of the riser to the cabinet
    cables.push([at(riserX, 0.12), at(-0.3, 0.12, 1.35), at(-2.15, 0.12, 1.35)], [at(-riserX, 0.12), at(-2.15, 0.12, 1.35)]);

    return { field, cabinet, rack, screen, cables, flows };
  }, []);

  return (
    <group>
      {model.field.map((f, i) => (
        <Float key={f.key} speed={0.8 + (i % 3) * 0.2} rotationIntensity={0.05} floatIntensity={0.12}>
          <Billboard position={f.pos}>
            <group scale={0.62}>{f.el}</group>
          </Billboard>
        </Float>
      ))}

      <Billboard position={model.cabinet}><BmsCabinet /></Billboard>
      <Billboard position={model.rack}><ServerRack /></Billboard>
      <Billboard position={model.screen}><Dashboard /></Billboard>
      <Glow position={[model.rack.x, model.rack.y, model.rack.z]} size={2.2} opacity={0.18} />
      <Glow position={[model.cabinet.x, model.cabinet.y, model.cabinet.z]} size={2.0} opacity={0.15} />

      {model.cables.map((pts, i) => (
        <Line key={i} points={pts} color="#C82909" lineWidth={1.3} transparent opacity={0.5} />
      ))}
      <DataPackets curves={model.flows} perCurve={2} speed={0.16} size={0.045} />
    </group>
  );
}
