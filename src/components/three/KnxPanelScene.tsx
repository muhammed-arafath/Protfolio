"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Glow, SceneCanvas } from "./common";
import { busAnchor, knxById, knxDevices, BUS, type KnxDevice, type KnxLayerId, knxLayers } from "@/content/knx";
import { useLowPower } from "@/lib/hooks";

/* ───────── Simulation state shared with the control UI ───────── */
export type KnxSim = {
  lights: boolean[];
  led: number[];
  curtain: "up" | "down" | null;
  ac: { on: boolean; mode: number; setpoint: number; fan: number; swing: boolean };
  door: boolean;
  presence: boolean;
  flash: Record<string, number>;
  irAt: number;
};
export type KnxPacket = { id: number; pts: [number, number][]; start: number; dur: number; color: string };

const Z_WIRE = -0.17;
const Z_PACKET = -0.08;
const v3 = ([x, y]: [number, number], z = Z_WIRE) => new THREE.Vector3(x, y, z);
const MODE_NAME: Record<number, string> = { 0: "AUTO", 1: "HEAT", 3: "COOL", 9: "FAN", 14: "DRY" };

/* ───────── Canvas textures (labels drawn locally, no font downloads) ───────── */
function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [w, h]);
  useEffect(() => {
    const c = tex.image as HTMLCanvasElement;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, w, h);
    draw(g, w, h);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex, ...deps]);
  return tex;
}

function wrapText(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 3) {
  const words = text.split(" ");
  let line = "", n = 0;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, x, y + n * lh);
      line = w;
      if (++n >= maxLines) return;
    } else line = t;
  }
  g.fillText(line, x, y + n * lh);
}

/* ───────── DIN-rail module ───────── */
const U = 0.26;
function DinModule({ d, hot, flashAt }: { d: KnxDevice; hot: boolean; flashAt?: number }) {
  const w = (d.units ?? 4) * U - 0.04;
  const h = 0.95;
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const isMW = d.kind === "meanwell";
  const face = useCanvasTexture(
    Math.round(w * 300),
    Math.round(h * 0.56 * 300),
    (g, W, H) => {
      g.fillStyle = isMW ? "#c9ced6" : "#eef1f5";
      g.fillRect(0, 0, W, H);
      g.fillStyle = isMW ? "#8E1C05" : "#C82909";
      g.fillRect(0, 0, W, 6);
      // number badge
      if (d.n) {
        g.fillStyle = "#1C1714";
        g.beginPath();
        g.arc(22, 26, 16, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#E8401C";
        g.font = "bold 18px Inter, Arial, sans-serif";
        g.textAlign = "center";
        g.fillText(String(d.n), 22, 32);
        g.textAlign = "left";
      }
      g.fillStyle = "#1C1714";
      const small = W < 200;
      g.font = `bold ${small ? 15 : 19}px Inter, Arial, sans-serif`;
      wrapText(g, d.kind === "mcb" ? "CHINT" : isMW ? "MEAN WELL" : "K·BUS", d.n ? 46 : 10, 32, W - 56, 20, 1);
      g.font = `${small ? 13 : 16}px Inter, Arial, sans-serif`;
      g.fillStyle = "#33415c";
      wrapText(g, d.model.split(" · ")[0].replace("K-BUS ", "").replace("CHINT ", "").replace("MEAN WELL ", ""), 10, 66, W - 20, 18, 1);
      g.fillStyle = "#1C1714";
      g.font = `600 ${small ? 13 : 16}px Inter, Arial, sans-serif`;
      wrapText(g, d.name.replace(/\(.*\)/, "").trim(), 10, 94, W - 20, 19, small ? 4 : 3);
    },
    [d.id]
  );

  useFrame(() => {
    if (!led.current) return;
    const t = flashAt ? performance.now() - flashAt : 1e9;
    const on = t < 450 && Math.floor(t / 90) % 2 === 0;
    led.current.color.set(on ? "#4dff9a" : d.line ? "#1f6b3c" : "#555");
  });

  const screws = useMemo(() => {
    const n = Math.max(2, Math.round((d.units ?? 4) * 1.5));
    return Array.from({ length: n }, (_, i) => -w / 2 + 0.08 + (i * (w - 0.16)) / (n - 1));
  }, [d.units, w]);

  return (
    <group>
      {/* body */}
      <RoundedBox args={[w, h, 0.42]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color={isMW ? "#b9bec7" : "#dfe4ea"} roughness={0.55} metalness={0.05} />
      </RoundedBox>
      {/* raised front cap with printed label */}
      <RoundedBox args={[w - 0.02, h * 0.56, 0.14]} radius={0.015} smoothness={2} position={[0, 0, 0.26]}>
        <meshStandardMaterial color={isMW ? "#c9ced6" : "#eef1f5"} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.332]}>
        <planeGeometry args={[w - 0.03, h * 0.56 - 0.01]} />
        <meshStandardMaterial map={face} roughness={0.6} />
      </mesh>
      {/* terminal screws top + bottom */}
      {screws.map((x) => (
        <group key={x}>
          <mesh position={[x, h / 2 - 0.1, 0.215]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.02, 12]} /><meshStandardMaterial color="#9aa3ae" metalness={0.9} roughness={0.3} /></mesh>
          <mesh position={[x, -h / 2 + 0.1, 0.215]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.02, 12]} /><meshStandardMaterial color="#9aa3ae" metalness={0.9} roughness={0.3} /></mesh>
        </group>
      ))}
      {/* KNX bus terminal (red/black) */}
      {d.line && (
        <group position={[w / 2 - 0.16, -h / 2 + 0.1, 0.24]}>
          <mesh position={[-0.04, 0, 0]}><boxGeometry args={[0.07, 0.07, 0.06]} /><meshStandardMaterial color="#d22" /></mesh>
          <mesh position={[0.04, 0, 0]}><boxGeometry args={[0.07, 0.07, 0.06]} /><meshStandardMaterial color="#222" /></mesh>
        </group>
      )}
      {/* status / prog LED */}
      <mesh position={[w / 2 - 0.1, h * 0.28 - 0.06, 0.336]}>
        <circleGeometry args={[0.025, 12]} />
        <meshBasicMaterial ref={led} color="#1f6b3c" toneMapped={false} />
      </mesh>
      {d.kind === "mcb" && (
        <mesh position={[0, 0.04, 0.37]}><boxGeometry args={[0.16, 0.2, 0.1]} /><meshStandardMaterial color="#1b1f27" /></mesh>
      )}
      {hot && <Edges scale={1.02} color="#E8401C" />}
    </group>
  );
}

/* ───────── Other device bodies ───────── */
function Badge({ n, position }: { n: number; position: [number, number, number] }) {
  const tex = useCanvasTexture(64, 64, (g) => {
    g.fillStyle = "#1C1714";
    g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#E8401C"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#E8401C"; g.font = "bold 28px Inter, Arial"; g.textAlign = "center"; g.fillText(String(n), 32, 42);
  }, [n]);
  return (
    <mesh position={position}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

function FlushDevice({ d, hot }: { d: KnxDevice; hot: boolean }) {
  const face = useCanvasTexture(200, 200, (g) => {
    g.fillStyle = "#f2f4f7"; g.fillRect(0, 0, 200, 200);
    g.fillStyle = "#C82909"; g.fillRect(0, 0, 200, 6);
    g.fillStyle = "#1C1714"; g.font = "bold 22px Inter, Arial"; g.fillText("K·BUS", 14, 40);
    g.fillStyle = "#33415c"; g.font = "16px Inter, Arial"; g.fillText(d.model.replace("K-BUS ", ""), 14, 66);
    g.fillStyle = "#1C1714"; g.font = "600 17px Inter, Arial"; wrapText(g, d.name, 14, 100, 172, 20, 3);
    if (d.id === "ir") { g.fillStyle = "#C82909"; g.font = "bold 16px Inter, Arial"; g.fillText("CH1   CH2", 14, 182); }
  }, [d.id]);
  return (
    <group>
      <RoundedBox args={[0.66, 0.66, 0.3]} radius={0.04}><meshStandardMaterial color="#e6eaf0" roughness={0.5} /></RoundedBox>
      <mesh position={[0, 0, 0.151]}><planeGeometry args={[0.62, 0.62]} /><meshStandardMaterial map={face} roughness={0.6} /></mesh>
      {d.n && <Badge n={d.n} position={[-0.26, 0.4, 0.16]} />}
      {hot && <Edges scale={1.03} color="#E8401C" />}
    </group>
  );
}

function SmartTouch({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const screen = useCanvasTexture(380, 260, (g, W, H) => {
    const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, "#1E1916"); grd.addColorStop(1, "#3A2A24");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = "#B0A599"; g.font = "14px Inter, Arial"; g.fillText("SMART TOUCH V50s", 16, 24);
    g.fillStyle = sim.door ? "#ff5a6a" : "#4dff9a"; g.fillText(sim.door ? "● DOOR OPEN" : "● DOOR CLOSED", 230, 24);
    // lights
    sim.lights.forEach((on, i) => {
      g.fillStyle = on ? "#ffd27a" : "#3A2E28"; g.beginPath(); g.arc(36 + i * 52, 70, 18, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#B0A599"; g.font = "12px Inter, Arial"; g.fillText(`L${i + 1}`, 28 + i * 52, 104);
    });
    // AC tile
    g.fillStyle = "#2E221D"; g.fillRect(16, 122, 200, 120);
    g.fillStyle = "#E8401C"; g.font = "13px Inter, Arial"; g.fillText("AC · 3/0/x", 28, 146);
    g.fillStyle = sim.ac.on ? "#F7F4EE" : "#6B5D54"; g.font = "bold 46px Inter, Arial"; g.fillText(`${sim.ac.setpoint}°`, 28, 200);
    g.font = "14px Inter, Arial"; g.fillText(sim.ac.on ? MODE_NAME[sim.ac.mode] ?? "" : "OFF", 130, 196);
    // LED + shutter
    g.fillStyle = "#B0A599"; g.font = "13px Inter, Arial"; g.fillText("LED strips", 236, 146);
    sim.led.forEach((v, i) => { g.fillStyle = "#3A2E28"; g.fillRect(236, 156 + i * 14, 120, 8); g.fillStyle = "#E8401C"; g.fillRect(236, 156 + i * 14, (120 * v) / 100, 8); });
    g.fillStyle = "#B0A599"; g.fillText(`Shutter A: ${sim.curtain ? (sim.curtain === "up" ? "▲ up" : "▼ down") : "—"}`, 236, 232);
  }, [sim.lights.join(), sim.led.join(), sim.ac.on, sim.ac.setpoint, sim.ac.mode, sim.door, sim.curtain]);
  return (
    <group>
      <RoundedBox args={[1.0, 0.7, 0.1]} radius={0.04}><meshStandardMaterial color="#0d0f14" metalness={0.5} roughness={0.25} /></RoundedBox>
      <mesh position={[0, 0, 0.051]}><planeGeometry args={[0.92, 0.62]} /><meshBasicMaterial map={screen} toneMapped={false} /></mesh>
      <Badge n={10} position={[-0.56, 0.42, 0.06]} />
      {hot && <Edges scale={1.03} color="#E8401C" />}
    </group>
  );
}

function WaltzPad({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const keys = [sim.lights[0], sim.led[0] > 0, sim.curtain !== null];
  return (
    <group>
      <RoundedBox args={[0.56, 0.56, 0.08]} radius={0.03}><meshPhysicalMaterial color="#141110" metalness={0.3} roughness={0.08} clearcoat={1} /></RoundedBox>
      {keys.map((on, i) => (
        <group key={i} position={[0, 0.16 - i * 0.16, 0.042]}>
          <mesh><planeGeometry args={[0.42, 0.11]} /><meshBasicMaterial color="#201A17" /></mesh>
          <mesh position={[-0.17, 0, 0.001]}><circleGeometry args={[0.018, 10]} /><meshBasicMaterial color={on ? "#E8401C" : "#3A302A"} toneMapped={false} /></mesh>
        </group>
      ))}
      <Badge n={11} position={[-0.36, 0.36, 0.05]} />
      {hot && <Edges scale={1.04} color="#E8401C" />}
    </group>
  );
}

function Pir({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.opacity = sim.presence ? 0.5 + 0.5 * Math.sin(clock.elapsedTime * 6) : 0.12;
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.06, 40]} /><meshStandardMaterial color="#eef1f5" roughness={0.5} /></mesh>
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[0.18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial color="#f7f9fc" roughness={0.3} transmission={0.3} thickness={0.2} /></mesh>
      <mesh position={[0, 0, 0.035]}><ringGeometry args={[0.2, 0.235, 40]} /><meshBasicMaterial ref={ring} color="#E8401C" transparent opacity={0.12} toneMapped={false} /></mesh>
      <Badge n={12} position={[-0.38, 0.22, 0.05]} />
      {hot && <Edges scale={1.04} color="#E8401C" />}
    </group>
  );
}

function DoorContact({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const mag = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (mag.current) mag.current.position.x = THREE.MathUtils.damp(mag.current.position.x, sim.door ? 0.38 : 0.15, 6, dt);
  });
  return (
    <group>
      <RoundedBox args={[0.22, 0.42, 0.1]} radius={0.02} position={[-0.08, 0, 0]}><meshStandardMaterial color="#f2f4f7" /></RoundedBox>
      <group ref={mag}><RoundedBox args={[0.12, 0.42, 0.1]} radius={0.02}><meshStandardMaterial color="#f2f4f7" /></RoundedBox></group>
      <mesh position={[-0.08, 0.13, 0.055]}><circleGeometry args={[0.02, 10]} /><meshBasicMaterial color={sim.door ? "#ff5a6a" : "#4dff9a"} toneMapped={false} /></mesh>
      <Badge n={15} position={[-0.08, 0.33, 0.06]} />
      {hot && <Edges scale={1.05} color="#E8401C" />}
    </group>
  );
}

function Lamps({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  return (
    <group>
      {sim.lights.map((on, i) => (
        <group key={i} position={[-0.68 + i * 0.45, 0, 0]}>
          <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.06, 0.07, 0.12, 16]} /><meshStandardMaterial color="#b5bcc7" metalness={0.8} roughness={0.3} /></mesh>
          <mesh><sphereGeometry args={[0.16, 24, 24]} /><meshPhysicalMaterial color={on ? "#fff3d6" : "#9aa6b8"} emissive={on ? "#ffc35a" : "#000"} emissiveIntensity={on ? 2.2 : 0} transmission={on ? 0 : 0.6} roughness={0.15} transparent opacity={0.95} toneMapped={!on} /></mesh>
          {on && <Glow size={1.1} color="#ffc35a" opacity={0.65} />}
        </group>
      ))}
      <Badge n={17} position={[-1.0, 0.25, 0.05]} />
      {hot && <mesh><boxGeometry args={[1.9, 0.6, 0.4]} /><meshBasicMaterial color="#E8401C" wireframe transparent opacity={0.4} /></mesh>}
    </group>
  );
}

function Strips({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  return (
    <group>
      {sim.led.map((v, i) => (
        <group key={i} position={[-0.75 + i * 0.5, 0, 0]}>
          <mesh><boxGeometry args={[0.42, 0.08, 0.05]} /><meshStandardMaterial color="#2A221E" /></mesh>
          <mesh position={[0, 0, 0.03]}><planeGeometry args={[0.38, 0.04]} /><meshBasicMaterial color={new THREE.Color("#3A302A").lerp(new THREE.Color("#FFF1D6"), v / 100)} toneMapped={false} /></mesh>
          {v > 0 && <Glow size={0.4 + v / 140} color="#FFD9A8" opacity={0.25 + (v / 100) * 0.6} position={[0, 0, 0.05]} />}
        </group>
      ))}
      <Badge n={18} position={[-1.1, 0.12, 0.05]} />
      {hot && <mesh><boxGeometry args={[2.1, 0.35, 0.3]} /><meshBasicMaterial color="#E8401C" wireframe transparent opacity={0.4} /></mesh>}
    </group>
  );
}

function Curtain({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const up = useRef<THREE.MeshBasicMaterial>(null);
  const down = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const blink = Math.sin(clock.elapsedTime * 10) > 0;
    up.current?.color.set(sim.curtain === "up" && blink ? "#ff3b4e" : "#4a1a20");
    down.current?.color.set(sim.curtain === "down" && blink ? "#3dff8a" : "#173d27");
  });
  return (
    <group>
      <RoundedBox args={[0.5, 0.36, 0.1]} radius={0.02}><meshStandardMaterial color="#e6eaf0" /></RoundedBox>
      <mesh position={[-0.11, 0, 0.055]}><circleGeometry args={[0.07, 20]} /><meshBasicMaterial ref={up} color="#4a1a20" toneMapped={false} /></mesh>
      <mesh position={[0.11, 0, 0.055]}><circleGeometry args={[0.07, 20]} /><meshBasicMaterial ref={down} color="#173d27" toneMapped={false} /></mesh>
      {sim.curtain && <Glow size={0.7} color={sim.curtain === "up" ? "#ff3b4e" : "#3dff8a"} opacity={0.5} position={[sim.curtain === "up" ? -0.11 : 0.11, 0, 0.08]} />}
      <Badge n={16} position={[-0.36, 0.22, 0.06]} />
      {hot && <Edges scale={1.05} color="#E8401C" />}
    </group>
  );
}

function Learner({ hot }: { hot: boolean }) {
  const label = useCanvasTexture(300, 70, (g) => {
    g.strokeStyle = "#B0A599"; g.setLineDash([6, 6]); g.strokeRect(2, 2, 296, 66);
    g.fillStyle = "#B0A599"; g.font = "16px Inter, Arial"; g.fillText("SETUP ONLY · not on the bus", 14, 28);
    g.fillStyle = "#E8401C"; g.fillText("USB → PC · ETS6 + IR DCA", 14, 52);
  }, []);
  return (
    <group>
      <RoundedBox args={[0.5, 0.26, 0.12]} radius={0.04}><meshStandardMaterial color="#20252e" /></RoundedBox>
      <mesh position={[0.32, 0, 0]}><boxGeometry args={[0.14, 0.1, 0.05]} /><meshStandardMaterial color="#b8c0cc" metalness={0.9} roughness={0.3} /></mesh>
      <mesh position={[-0.2, 0, 0.065]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#5a1020" /></mesh>
      <Badge n={19} position={[-0.38, 0.2, 0.07]} />
      <mesh position={[0.85, 0, 0]}><planeGeometry args={[1.0, 0.24]} /><meshBasicMaterial map={label} transparent toneMapped={false} /></mesh>
      {hot && <Edges scale={1.06} color="#E8401C" />}
    </group>
  );
}

function AirCon({ sim, hot }: { sim: KnxSim; hot: boolean }) {
  const louvre = useRef<THREE.Group>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const display = useCanvasTexture(160, 60, (g) => {
    g.fillStyle = "#0a0f18"; g.fillRect(0, 0, 160, 60);
    g.fillStyle = sim.ac.on ? "#FF8A5C" : "#223"; g.font = "bold 34px Inter, Arial"; g.fillText(sim.ac.on ? `${sim.ac.setpoint}°` : "--", 12, 42);
    g.font = "13px Inter, Arial"; g.fillText(sim.ac.on ? MODE_NAME[sim.ac.mode] ?? "" : "", 96, 26);
    g.fillText(sim.ac.on ? ["AUTO", "LOW", "MID", "HIGH"][[0, 33, 66, 100].indexOf(sim.ac.fan)] ?? "" : "", 96, 46);
  }, [sim.ac.on, sim.ac.setpoint, sim.ac.mode, sim.ac.fan]);

  useFrame(({ clock }, dt) => {
    if (louvre.current) {
      const target = !sim.ac.on ? 0 : sim.ac.swing ? 0.5 + Math.sin(clock.elapsedTime * 1.6) * 0.35 : 0.6;
      louvre.current.rotation.x = THREE.MathUtils.damp(louvre.current.rotation.x, target, 4, dt);
    }
    if (beam.current) {
      const t = performance.now() - sim.irAt;
      beam.current.opacity = t < 700 ? (1 - t / 700) * 0.9 : 0;
    }
  });
  return (
    <group>
      <RoundedBox args={[2.2, 0.62, 0.42]} radius={0.12} smoothness={4}><meshStandardMaterial color="#f4f6f9" roughness={0.35} /></RoundedBox>
      <mesh position={[0.62, 0.08, 0.215]}><planeGeometry args={[0.5, 0.19]} /><meshBasicMaterial map={display} toneMapped={false} /></mesh>
      {/* IR receiver window + stuck emitter */}
      <mesh position={[0.98, 0.08, 0.214]}><planeGeometry args={[0.12, 0.1]} /><meshStandardMaterial color="#2a0f18" roughness={0.1} /></mesh>
      <mesh position={[0.98, 0.08, 0.235]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[0.98, 0.08, 0.27]}><circleGeometry args={[0.16, 24]} /><meshBasicMaterial ref={beam} color="#c48bff" transparent opacity={0} toneMapped={false} /></mesh>
      {/* louvre */}
      <group ref={louvre} position={[0, -0.26, 0.17]}>
        <mesh position={[0, -0.04, 0]}><boxGeometry args={[1.9, 0.08, 0.02]} /><meshStandardMaterial color="#dfe4ea" /></mesh>
      </group>
      {sim.ac.on && <Glow size={1.6} color="#FFB08F" opacity={0.25} position={[0, -0.45, 0.3]} />}
      {hot && <Edges scale={1.03} color="#E8401C" />}
    </group>
  );
}

/* ───────── Device wrapper (selection + hover) ───────── */
function Device({ d, sim, selected, onSelect }: { d: KnxDevice; sim: KnxSim; selected: boolean; onSelect: (id: string) => void }) {
  const [hover, setHover] = useState(false);
  const hot = selected || hover;
  const body = (() => {
    switch (d.kind) {
      case "din": case "psu": case "mcb": case "meanwell": case "coupler": return <DinModule d={d} hot={hot} flashAt={sim.flash[d.id]} />;
      case "flush": return <FlushDevice d={d} hot={hot} />;
      case "touch": return <SmartTouch sim={sim} hot={hot} />;
      case "pad": return <WaltzPad sim={sim} hot={hot} />;
      case "pir": return <Pir sim={sim} hot={hot} />;
      case "door": return <DoorContact sim={sim} hot={hot} />;
      case "lamps": return <Lamps sim={sim} hot={hot} />;
      case "strips": return <Strips sim={sim} hot={hot} />;
      case "curtain": return <Curtain sim={sim} hot={hot} />;
      case "learner": return <Learner hot={hot} />;
      case "ac": return <AirCon sim={sim} hot={hot} />;
    }
  })();
  return (
    <group
      position={[d.pos[0], d.pos[1], 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(d.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
    >
      {body}
      {selected && <Glow size={2.2} opacity={0.18} position={[0, 0, -0.1]} />}
    </group>
  );
}

/* ───────── Wiring layers ───────── */
function useWiring() {
  return useMemo(() => {
    const D = knxById;
    const top = (id: string): [number, number] => [D[id].pos[0], D[id].pos[1] + 0.475];
    const bot = (id: string): [number, number] => [D[id].pos[0], D[id].pos[1] - 0.475];
    const W: Record<KnxLayerId, [number, number][][]> = { bus: [], aux: [], ac230: [], dc12: [] };

    // KNX bus: sub trunk + drops, main trunk + drops
    const sub = knxDevices.filter((d) => d.line === "sub");
    const xs = sub.map((d) => d.pos[0]);
    W.bus.push([[Math.min(...xs), BUS.subY], [Math.max(...xs), BUS.subY]]);
    sub.forEach((d) => W.bus.push([busAnchor(d, "sub"), [d.pos[0], BUS.subY]]));
    const lc = D[BUS.coupler];
    W.bus.push([[lc.pos[0], BUS.mainY], [D.tuya.pos[0], BUS.mainY]]);
    ["psu2", "tuya"].forEach((id) => W.bus.push([busAnchor(D[id], "main"), [D[id].pos[0], BUS.mainY]]));
    W.bus.push([busAnchor(lc, "main"), [lc.pos[0], BUS.mainY]]);
    W.bus.push([busAnchor(D.psu1, "sub"), [D.psu1.pos[0], BUS.subY]]);

    // Aux 30 V from PSU 2 (I2) to Tuya gateway, Smart Touch, WALTZ
    const ax = D.psu2.pos[0] + 0.25;
    W.aux.push([[ax, -1.225], [ax, -2.0], [1.65, -2.0], [1.65, 0.5], [D.st.pos[0] + 0.15, 0.5], [D.st.pos[0] + 0.15, 0.9]]);
    W.aux.push([[1.65, 0.5], [D.waltz.pos[0] + 0.12, 0.5], [D.waltz.pos[0] + 0.12, 0.97]]);
    W.aux.push([[D.tuya.pos[0] + 0.25, -2.0], [D.tuya.pos[0] + 0.25, -1.225]]);

    // 230 V from MCB to PSUs, actuators, Mean Well + loads
    const L = 2.05;
    W.ac230.push([top("mcb"), [D.mcb.pos[0], L], [D.mw.pos[0], L], top("mw")]);
    ["psu1", "sw", "sh"].forEach((id) => W.ac230.push([[D[id].pos[0] - 0.3, L], [D[id].pos[0] - 0.3, 1.675]]));
    W.ac230.push([[D.mcb.pos[0], L], [-4.85, L], [-4.85, -2.2], [D.psu2.pos[0] - 0.25, -2.2], [D.psu2.pos[0] - 0.25, -1.225]]);
    for (let i = 0; i < 4; i++) W.ac230.push([[D.sw.pos[0] - 0.39 + i * 0.26, 1.675], [D.lamps.pos[0] - 0.68 + i * 0.45, 2.33]]);
    W.ac230.push([[D.sh.pos[0] + 0.2, 1.675], [D.sh.pos[0] + 0.2, 2.2], [D.curtain.pos[0], 2.2], [D.curtain.pos[0], 2.37]]);

    // 12 V DC: Mean Well → dimmer → strips
    W.dc12.push([bot("mw"), [D.mw.pos[0], 0.55], [D.dim.pos[0] + 0.3, 0.55], [D.dim.pos[0] + 0.3, 0.725]]);
    for (let i = 0; i < 4; i++) W.dc12.push([[D.dim.pos[0] - 0.39 + i * 0.26, 1.675], [D.strips.pos[0] - 0.75 + i * 0.5, 2.51]]);
    return W;
  }, []);
}

/* ───────── Telegrams travelling on the bus ───────── */
function Packets({ packets }: { packets: KnxPacket[] }) {
  const curves = useMemo(
    () => packets.map((p) => {
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 1; i < p.pts.length; i++) path.add(new THREE.LineCurve3(v3(p.pts[i - 1], Z_PACKET), v3(p.pts[i], Z_PACKET)));
      return path;
    }),
    [packets]
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const now = performance.now();
    packets.forEach((p, i) => {
      const g = refs.current[i];
      if (!g) return;
      const u = (now - p.start) / p.dur;
      g.visible = u >= 0 && u <= 1;
      if (g.visible) g.position.copy(curves[i].getPointAt(Math.min(1, Math.max(0, u))));
    });
  });
  return (
    <>
      {packets.map((p, i) => (
        <group key={p.id} ref={(g) => { refs.current[i] = g; }} visible={false}>
          <mesh><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={p.color} toneMapped={false} /></mesh>
          <Glow size={0.7} color={p.color} opacity={0.9} />
        </group>
      ))}
    </>
  );
}

/* ───────── Camera rig ───────── */
function Rig({ target }: { target: [number, number] | null }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const low = useLowPower();
  const until = useRef(0);
  const { size } = useThree();
  // Distance that fits the whole demo case (≈10.8 × 7.4 units) into the canvas.
  const fit = useMemo(() => {
    const t = Math.tan(THREE.MathUtils.degToRad(42 / 2));
    const aspect = size.width / Math.max(1, size.height);
    return Math.max(10.6 / 2 / (t * aspect), 7.0 / 2 / t) * 0.98;
  }, [size.width, size.height]);
  useEffect(() => { until.current = performance.now() + 1500; }, [target, fit]);
  useFrame(({ camera }, dt) => {
    const c = controls.current;
    if (!c) return;
    if (performance.now() < until.current) {
      const g = target ? new THREE.Vector3(target[0], target[1], 0) : new THREE.Vector3(0.1, 0.15, 0);
      c.target.lerp(g, 1 - Math.exp(-4 * dt));
      const want = target ? (low ? 6.5 : 4.2) : fit;
      const dir = camera.position.clone().sub(c.target);
      dir.setLength(THREE.MathUtils.damp(dir.length(), want, 3, dt));
      camera.position.copy(c.target).add(dir);
    }
    c.update();
  });
  return (
    <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping target={[0, 0.25, 0]} minDistance={2.5} maxDistance={Math.max(14, fit * 1.3)}
      minAzimuthAngle={-0.75} maxAzimuthAngle={0.75} minPolarAngle={0.9} maxPolarAngle={2.1} />
  );
}

/* ───────── Scene ───────── */
export default function KnxPanelScene({ sim, packets, layers, selected, onSelect }: {
  sim: KnxSim; packets: KnxPacket[]; layers: Set<KnxLayerId>; selected: string | null; onSelect: (id: string | null) => void;
}) {
  const low = useLowPower();
  const wires = useWiring();
  const sel = selected ? knxById[selected] : null;
  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: low ? [0, 0.4, 20] : [0.6, 0.4, 13], fov: 42 }} onPointerMissed={() => onSelect(null)}>
      <color attach="background" args={["#141110"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 8]} intensity={1.4} color="#FFF4EC" />
      <pointLight position={[-4, 3, 3]} intensity={6} distance={12} color="#E8714F" />
      {!low && (
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color="#FFF1E8" position={[0, 5, 6]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#E8401C" position={[-6, 0, 4]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
      </Environment>
      )}

      {/* back plate (demo case) + wall zone */}
      <mesh position={[-1.75, 0.15, -0.26]}><boxGeometry args={[6.8, 6.6, 0.08]} /><meshStandardMaterial color="#221C19" metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[3.35, 0.15, -0.27]}><boxGeometry args={[3.3, 6.6, 0.06]} /><meshStandardMaterial color="#2A221E" roughness={0.8} /></mesh>
      <mesh position={[0.2, 0.15, -0.31]}><boxGeometry args={[10.5, 6.9, 0.04]} /><meshStandardMaterial color="#151110" metalness={0.4} roughness={0.6} /></mesh>
      {/* DIN rails */}
      {[1.2, -0.75].map((y) => (
        <mesh key={y} position={[-2.9, y, -0.22]}><boxGeometry args={[4.6, 0.36, 0.03]} /><meshStandardMaterial color="#aeb6c2" metalness={1} roughness={0.25} /></mesh>
      ))}

      {/* wiring layers */}
      {knxLayers.map((l) =>
        layers.has(l.id)
          ? wires[l.id].map((pts, i) => <Line key={`${l.id}-${i}`} points={pts.map((p) => v3(p))} color={l.color} lineWidth={l.id === "bus" ? 2.6 : 1.8} transparent opacity={0.9} />)
          : null
      )}
      {/* IR emitter cable CH2 → AC, door contact → KI/U */}
      <Line points={[[-1.05, -1.08], [-1.05, -2.45], [1.95, -2.45], [1.95, -1.6], [3.98, -1.6], [3.98, -1.47]].map((p) => v3(p as [number, number]))} color="#c48bff" lineWidth={1.4} dashed dashSize={0.08} gapSize={0.05} />
      <Line points={[[0.6, -0.75], [0.33, -0.75]].map((p) => v3(p as [number, number]))} color="#B0A599" lineWidth={1.2} />

      {knxDevices.map((d) => (
        <Device key={d.id} d={d} sim={sim} selected={selected === d.id} onSelect={(id) => onSelect(id === selected ? null : id)} />
      ))}

      <Packets packets={packets} />
      <Rig target={sel ? sel.pos : null} />
    </SceneCanvas>
  );
}
