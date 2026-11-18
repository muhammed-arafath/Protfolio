"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Environment, Lightformer, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { C, DataPackets, Glow, SceneCanvas } from "./common";
import { useLowPower, useReducedMotion } from "@/lib/hooks";

/** LCD texture with the example reading from the firmware README. */
function useLcd() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 300;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1A1412"; g.fillRect(0, 0, 512, 300);
    g.fillStyle = "#E8401C"; g.font = "bold 92px Inter, Arial"; g.fillText("368", 28, 112);
    g.font = "26px Inter, Arial"; g.fillStyle = "#B0A599"; g.fillText("CO₂ ppm", 210, 108);
    g.fillStyle = "#4dff9a"; g.font = "bold 24px Inter, Arial"; g.fillText("GOOD", 380, 108);
    const tiles = [["24.1", "°C"], ["31.9", "%RH"], ["1", "VOC ppb"], ["2", "CH₂O"]];
    tiles.forEach(([v, u], i) => {
      g.fillStyle = "#2E221D"; g.fillRect(24 + i * 120, 150, 108, 120);
      g.fillStyle = "#F7F4EE"; g.font = "bold 38px Inter, Arial"; g.fillText(v, 36 + i * 120, 210);
      g.fillStyle = "#B0A599"; g.font = "18px Inter, Arial"; g.fillText(u, 36 + i * 120, 246);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function Part({ id, selected, onSelect, children, offset }: { id: string; selected: string | null; onSelect: (id: string) => void; children: React.ReactNode; offset: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, offset.x, 5, dt);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, offset.y, 5, dt);
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, offset.z, 5, dt);
  });
  const hot = hover || selected === id;
  return (
    <group
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
    >
      {children}
      {hot && <Glow size={2.2} opacity={0.18} />}
    </group>
  );
}

function Model({ explode, selected, onSelect }: { explode: number; selected: string | null; onSelect: (id: string) => void }) {
  const low = useLowPower();
  const reduce = useReducedMotion();
  const lcd = useLcd();
  const root = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const e = explode;

  useFrame(({ clock, pointer }, dt) => {
    if (root.current && !reduce) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.55 + pointer.x * 0.25, 2, dt);
    }
    if (led.current) led.current.color.set(Math.sin(clock.elapsedTime * 3) > -0.6 ? "#E8401C" : "#3A1A10");
  });

  const off = {
    case: new THREE.Vector3(0, 0, -1.1 * e),
    mcu: new THREE.Vector3(0, 0, 0),
    sensors: new THREE.Vector3(0, 0, 0.55 * e),
    cb3s: new THREE.Vector3(0.9 * e, 0.7 * e, 0.9 * e),
    front: new THREE.Vector3(0, 0, 1.6 * e),
  };

  // UART link MCU → CB3S (P10/P11) + Wi-Fi to broker
  const curves = useMemo(() => {
    const a = new THREE.Vector3(-0.35, -0.3, 0.06);
    const b = new THREE.Vector3(0.72 + 0.9 * e, 0.62 + 0.7 * e, 0.1 + 0.9 * e);
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.3, 0.3));
    return [new THREE.QuadraticBezierCurve3(a, mid, b)];
  }, [e]);
  const linePts = useMemo(() => curves[0].getPoints(30), [curves]);

  return (
    <group ref={root} rotation={[0.18, -0.55, 0]}>
      {/* back shell */}
      <Part id="case" selected={selected} onSelect={onSelect} offset={off.case}>
        <RoundedBox args={[2.6, 2.6, 0.5]} radius={0.22} smoothness={4} position={[0, 0, -0.3]}>
          <meshPhysicalMaterial color="#f3f5f8" roughness={0.35} clearcoat={0.4} />
        </RoundedBox>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-0.8 + i * 0.2, 1.301, -0.3]}><boxGeometry args={[0.08, 0.01, 0.3]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
        ))}
      </Part>

      {/* TuyaMCU board */}
      <Part id="mcu" selected={selected} onSelect={onSelect} offset={off.mcu}>
        <RoundedBox args={[2.3, 2.3, 0.05]} radius={0.04}><meshStandardMaterial color="#0d2a1f" roughness={0.6} /></RoundedBox>
        <mesh position={[-0.35, -0.3, 0.05]}><boxGeometry args={[0.36, 0.36, 0.06]} /><meshStandardMaterial color="#111" roughness={0.4} /></mesh>
        <mesh position={[-0.35, -0.3, 0.081]}><circleGeometry args={[0.03, 12]} /><meshBasicMaterial color="#666" /></mesh>
        {[[-0.9, -0.85], [-0.6, -0.85], [0.5, -0.9], [0.8, -0.7]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.04]}><boxGeometry args={[0.14, 0.08, 0.04]} /><meshStandardMaterial color="#c9a46a" metalness={0.6} /></mesh>
        ))}
        {selected === "mcu" && <Edges color="#E8401C" />}
      </Part>

      {/* sensors on the board */}
      <Part id="sensors" selected={selected} onSelect={onSelect} offset={off.sensors}>
        {/* CO2 NDIR module */}
        <RoundedBox args={[0.9, 0.42, 0.3]} radius={0.03} position={[-0.45, 0.55, 0.2]}><meshStandardMaterial color="#c8a24a" metalness={0.85} roughness={0.25} /></RoundedBox>
        {/* VOC / CH2O sensor */}
        <mesh position={[0.55, 0.45, 0.2]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.24, 0.24, 0.3, 32]} /><meshStandardMaterial color="#2b3240" metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[0.55, 0.45, 0.352]}><circleGeometry args={[0.16, 32]} /><meshStandardMaterial color="#6b7480" metalness={0.8} roughness={0.5} wireframe /></mesh>
        {/* temp / humidity */}
        <RoundedBox args={[0.3, 0.3, 0.12]} radius={0.02} position={[0.55, -0.45, 0.12]}><meshStandardMaterial color="#e8ecf2" /></RoundedBox>
      </Part>

      {/* CB3S module */}
      <Part id="cb3s" selected={selected} onSelect={onSelect} offset={off.cb3s}>
        <group position={[0.75, 0.65, 0.1]}>
          <mesh><boxGeometry args={[0.48, 0.58, 0.03]} /><meshStandardMaterial color="#1E1916" /></mesh>
          <mesh position={[0, -0.06, 0.04]}><boxGeometry args={[0.38, 0.36, 0.05]} /><meshStandardMaterial color="#c7d3e6" metalness={1} roughness={0.22} /></mesh>
          <mesh position={[0, 0.23, 0.017]}><boxGeometry args={[0.38, 0.06, 0.004]} /><meshBasicMaterial color={C.cyan} toneMapped={false} /></mesh>
          <Glow size={0.6} position={[0, 0.23, 0.05]} opacity={0.6} />
          {selected === "cb3s" && <Edges color="#E8401C" />}
        </group>
      </Part>

      {/* front bezel with LCD, LED P6 and button P26 */}
      <Part id="front" selected={selected} onSelect={onSelect} offset={off.front}>
        <group position={[0, 0, 0.42]}>
          <RoundedBox args={[2.6, 2.6, 0.12]} radius={0.06} smoothness={4}>
            <meshPhysicalMaterial color="#f7f8fa" roughness={0.3} transparent opacity={e > 0.05 ? 0.55 : 1} clearcoat={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.2, 0.062]}><planeGeometry args={[1.9, 1.12]} /><meshBasicMaterial map={lcd} toneMapped={false} /></mesh>
          <mesh position={[-0.9, -0.95, 0.065]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial ref={led} color="#E8401C" toneMapped={false} /></mesh>
          <mesh position={[0.9, -0.95, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.04, 24]} /><meshStandardMaterial color="#dfe3ea" /></mesh>
        </group>
      </Part>

      {/* UART link + packets */}
      <Line points={linePts} color="#E8401C" lineWidth={1.5} transparent opacity={0.55} dashed dashSize={0.06} gapSize={0.04} />
      <DataPackets curves={curves} perCurve={low ? 2 : 3} speed={0.6} size={0.035} />
    </group>
  );
}

export default function AirBoxScene({ explode, selected, onSelect }: { explode: number; selected: string | null; onSelect: (id: string | null) => void }) {
  const low = useLowPower();
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: low ? [0, 0.5, 9] : [0, 0.4, 7], fov: 40 }} onPointerMissed={() => onSelect(null)}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#FFF4EC" />
      <pointLight position={[-3, 1, 3]} intensity={6} distance={10} color="#C82909" />
      {!low && (
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color="#FFF1E8" position={[0, 4, 5]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#E8401C" position={[-4, 0, 3]} scale={2} />
      </Environment>
      )}
      <Model explode={explode} selected={selected} onSelect={(id) => onSelect(id === selected ? null : id)} />
      <OrbitControls enablePan={false} enableDamping minDistance={4} maxDistance={12} />
    </SceneCanvas>
  );
}
