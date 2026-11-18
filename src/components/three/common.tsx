"use client";
import { Component, createContext, useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, type CanvasProps } from "@react-three/fiber";
import * as THREE from "three";
import { useLowPower, useReducedMotion } from "@/lib/hooks";

export const C = {
  cyan: new THREE.Color("#E8401C"),
  neon: new THREE.Color("#C82909"),
  accent: new THREE.Color("#8E1C05"),
  steel: new THREE.Color("#1a2640"),
  dark: new THREE.Color("#1C1714"),
};

/**
 * Canvas wrapper: renders only while on-screen, clamps DPR, lighter on phones.
 * Children receive nothing special — read `useLowPower()` inside scenes when needed.
 */
/** Stable DOM host (outlives the Canvas) for drei <Html> portals, so unmounting never orphans labels. */
const HostCtx = createContext<RefObject<HTMLDivElement | null> | null>(null);
export const useSceneHost = () => (useContext(HostCtx) ?? undefined) as RefObject<HTMLElement> | undefined;

let webglOk: boolean | null = null;
function hasWebGL() {
  if (webglOk !== null) return webglOk;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    webglOk = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); // free the slot — browsers cap live contexts
  } catch {
    webglOk = false;
  }
  return webglOk;
}

/** If the WebGL context can't be created, show the fallback instead of an empty box. */
class SceneBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function SceneCanvas({ className, children, camera, fallback = null, onCreated, ...rest }: CanvasProps & { className?: string; fallback?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false); // within ~half a screen → keep the WebGL context
  const [visible, setVisible] = useState(false); // on screen → animate
  const [supported, setSupported] = useState(true);
  const [generation, setGeneration] = useState(0); // bump to rebuild after a lost context
  const [idle, setIdle] = useState(false); // let the page paint before the (blocking) 3D setup
  const low = useLowPower();

  useEffect(() => {
    setSupported(hasWebGL());
    let cancelled = false;
    const go = () => !cancelled && setIdle(true);
    const raf = requestAnimationFrame(() => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 600 });
      else setTimeout(go, 120);
    });
    const el = ref.current;
    if (!el) return;
    const a = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "50% 0px" });
    const b = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px 0px" });
    a.observe(el);
    b.observe(el);
    return () => { cancelled = true; cancelAnimationFrame(raf); a.disconnect(); b.disconnect(); };
  }, []);

  return (
    <div ref={ref} className={className}>
      {!supported && fallback}
      {supported && generation > 3 && fallback}
      {supported && generation <= 3 && near && idle && (
        <SceneBoundary fallback={fallback}>
        <Canvas
          key={generation}
          frameloop={visible ? "always" : "never"}
          dpr={low ? [1, 1.25] : [1, 1.75]}
          gl={{ antialias: !low, alpha: true, powerPreference: "high-performance" }}
          camera={camera}
          onCreated={(state) => {
            // GPU reset / sleep-wake can drop the context — rebuild the scene instead of staying blank.
            state.gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              // rebuild a few times; after that keep the static fallback instead of looping
              setTimeout(() => setGeneration((g) => g + 1), 400);
            }, { once: true });
            onCreated?.(state);
          }}
          {...rest}
        >
          <HostCtx.Provider value={ref}>{children}</HostCtx.Provider>
        </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}

/** Soft radial glow texture, generated once (no asset download). */
let glowTex: THREE.Texture | null = null;
export function getGlowTexture() {
  if (glowTex) return glowTex;
  const s = 128;
  const cv = document.createElement("canvas");
  cv.width = cv.height = s;
  const g = cv.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.2, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.5, "rgba(255,255,255,0.12)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  glowTex = new THREE.CanvasTexture(cv);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

export function Glow({ color = C.cyan, size = 0.6, opacity = 0.9, position }: { color?: THREE.Color | string; size?: number; opacity?: number; position?: [number, number, number] }) {
  const tex = useMemo(() => getGlowTexture(), []);
  return (
    <sprite position={position} scale={[size, size, size]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

/** Builds an arched curve between two points. */
export function arc(a: THREE.Vector3, b: THREE.Vector3, lift = 0.8) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift + a.distanceTo(b) * 0.12;
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

/**
 * Packets travelling along a set of curves, rendered as one instanced mesh.
 * `intensity(i)` lets callers brighten specific curves (e.g. a selected stage).
 */
export function DataPackets({
  curves,
  perCurve = 3,
  speed = 0.25,
  size = 0.045,
  color = C.cyan,
  scaleFor,
}: {
  curves: THREE.Curve<THREE.Vector3>[];
  perCurve?: number;
  speed?: number;
  size?: number;
  color?: THREE.Color;
  scaleFor?: (curveIndex: number) => number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = curves.length * perCurve;
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => (i % perCurve) / perCurve + Math.random() * 0.15), [count, perCurve]);
  const speeds = useMemo(() => Array.from({ length: count }, () => speed * (0.75 + Math.random() * 0.5)), [count, speed]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reduce ? 0 : clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const ci = Math.floor(i / perCurve);
      const u = (offsets[i] + t * speeds[i]) % 1;
      curves[ci].getPoint(u, p);
      const s = (scaleFor ? scaleFor(ci) : 1) * Math.sin(u * Math.PI) * 1.2 + 0.0001;
      sc.setScalar(s);
      m.compose(p, q, sc);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!count) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[size, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

/** Slowly drifting ambient dust / data particles. */
export function DustField({ count = 400, radius = 9, height = 7, color = C.neon, size = 0.035 }: { count?: number; radius?: number; height?: number; color?: THREE.Color; size?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * height;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius, height]);
  useFrame((_, dt) => {
    if (reduce || !ref.current) return;
    const a = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i) + dt * 0.12;
      if (y > height) y = 0;
      a.setY(i, y);
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} map={getGlowTexture()} />
    </points>
  );
}
