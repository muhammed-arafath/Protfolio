"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Play, ShieldCheck, X } from "lucide-react";
import { rtosHardware, rtosHeap, rtosIpc, rtosScenarios, rtosTasks, rtosTls } from "@/content/freertos";
import { useOnceInView, useReducedMotion } from "@/lib/hooks";

const AirBoxScene = dynamic(() => import("@/components/three/AirBoxScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted">loading 3D model…</div>,
});

/* ───────── Task / IPC diagram layout ───────── */
type N = { id: string; x: number; y: number; kind: "task" | "ipc" | "hw"; title: string; sub: string };
const nodes: N[] = [
  { id: "btn", x: 80, y: 70, kind: "hw", title: "Button P26", sub: "active LOW" },
  { id: "mcu", x: 80, y: 205, kind: "hw", title: "TuyaMCU", sub: "UART1 · 9600" },
  { id: "button", x: 285, y: 70, kind: "task", title: "button", sub: "prio 4 · 384 w" },
  { id: "sensor", x: 285, y: 205, kind: "task", title: "sensor", sub: "prio 2 · 512 w" },
  { id: "wifi", x: 285, y: 345, kind: "task", title: "wifi", sub: "prio 2 · 768 w" },
  { id: "sysq", x: 495, y: 70, kind: "ipc", title: "g_sysQueue", sub: "queue · 4" },
  { id: "mailbox", x: 495, y: 205, kind: "ipc", title: "g_sensorMailbox", sub: "overwrite · 1" },
  { id: "events", x: 495, y: 345, kind: "ipc", title: "g_events", sub: "event group" },
  { id: "app", x: 715, y: 70, kind: "task", title: "app", sub: "prio 3 · 512 w" },
  { id: "mqtt", x: 715, y: 165, kind: "task", title: "main · MQTT", sub: "mTLS · 5 s" },
  { id: "web", x: 715, y: 255, kind: "task", title: "web", sub: "prio 2 · 1088 w" },
  { id: "led", x: 715, y: 345, kind: "task", title: "led", sub: "prio 1 · 256 w" },
];
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
const edges: [string, string][] = [
  ["btn", "button"], ["mcu", "sensor"], ["button", "sysq"], ["sysq", "app"], ["sensor", "mailbox"], ["mailbox", "mqtt"], ["mailbox", "web"],
  ["wifi", "events"], ["events", "led"], ["events", "sensor"], ["events", "web"], ["button", "led"],
];
const NW = 150, NH = 52;

function TaskDiagram() {
  const reduce = useReducedMotion();
  const [scenario, setScenario] = useState<string | null>(null);
  const [hop, setHop] = useState(-1);
  const [p, setP] = useState(0);
  const [log, setLog] = useState<string[]>(["[MAIN] Tasks started — pick a scenario"]);
  const raf = useRef(0);
  const sc = rtosScenarios.find((s) => s.id === scenario);

  useEffect(() => {
    if (!sc || hop < 0) return;
    if (hop >= sc.hops.length) {
      const t = setTimeout(() => { setScenario(null); setHop(-1); }, 1200);
      return () => clearTimeout(t);
    }
    setLog((l) => [sc.hops[hop].log, ...l].slice(0, 9));
    const dur = reduce ? 500 : 1100;
    const t0 = performance.now();
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / dur);
      setP(u);
      if (u < 1) raf.current = requestAnimationFrame(step);
      else setTimeout(() => setHop((h) => h + 1), 200);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [sc, hop, reduce]);

  const run = (id: string) => {
    cancelAnimationFrame(raf.current);
    setScenario(id);
    setHop(0);
    setP(0);
  };

  const cur = sc && hop >= 0 && hop < sc.hops.length ? sc.hops[hop] : null;
  const done = new Set(sc ? sc.hops.slice(0, Math.max(0, hop)).map((h) => `${h.from}>${h.to}`) : []);
  const anchor = (a: N, b: N) => {
    // leave/enter from the box edge facing the other node
    const dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) > Math.abs(dy) * 1.2) return { x: a.x + Math.sign(dx) * NW / 2, y: a.y };
    return { x: a.x, y: a.y + Math.sign(dy) * NH / 2 };
  };
  const dot = cur ? (() => {
    const a = byId[cur.from], b = byId[cur.to];
    const s = anchor(a, b), e = anchor(b, a);
    return { x: s.x + (e.x - s.x) * p, y: s.y + (e.y - s.y) * p, label: cur.label, lx: (s.x + e.x) / 2, ly: (s.y + e.y) / 2 };
  })() : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="glass overflow-hidden rounded-3xl p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {rtosScenarios.map((s) => (
            <button key={s.id} onClick={() => run(s.id)} aria-pressed={scenario === s.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${scenario === s.id ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-line/15 text-muted hover:text-ink"}`}>
              <Play className="h-3 w-3" /> {s.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 800 400" className="h-auto w-full min-w-[620px]" role="img" aria-label="FreeRTOS tasks and inter-task communication diagram">
            <defs>
              <pattern id="rt-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgb(var(--line) / .06)" /></pattern>
              <filter id="rt-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="800" height="400" fill="url(#rt-grid)" />
            {edges.map(([a, b]) => {
              const A = byId[a], B = byId[b];
              const s = anchor(A, B), e = anchor(B, A);
              const active = cur && cur.from === a && cur.to === b;
              const past = done.has(`${a}>${b}`);
              return <line key={`${a}-${b}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke={active || past ? "rgb(var(--cyan))" : "rgb(var(--line) / .22)"} strokeWidth={active ? 2 : 1.2} strokeDasharray={active ? "5 6" : undefined} />;
            })}
            {nodes.map((n) => {
              const on = cur && (cur.from === n.id || cur.to === n.id);
              const color = n.kind === "ipc" ? "rgb(var(--accent))" : n.kind === "hw" ? "rgb(var(--muted))" : "rgb(var(--cyan))";
              return (
                <g key={n.id}>
                  <rect x={n.x - NW / 2} y={n.y - NH / 2} width={NW} height={NH} rx={n.kind === "ipc" ? 26 : 10}
                    fill="rgb(var(--bg2))" stroke={on ? "rgb(var(--cyan))" : color} strokeOpacity={on ? 1 : 0.45} strokeWidth={on ? 2 : 1} strokeDasharray={n.kind === "hw" ? "4 4" : undefined} />
                  <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="13" fontWeight="600" fill="rgb(var(--ink))" fontFamily={n.kind === "task" ? "var(--font-mono)" : undefined}>{n.title}</text>
                  <text x={n.x} y={n.y + 14} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))" fontFamily="var(--font-mono)">{n.sub}</text>
                </g>
              );
            })}
            {dot && (
              <g>
                <rect x={dot.lx - dot.label.length * 3.2 - 8} y={dot.ly - 24} width={dot.label.length * 6.4 + 16} height="18" rx="9" fill="rgb(var(--bg))" stroke="rgb(var(--cyan) / .5)" />
                <text x={dot.lx} y={dot.ly - 11.5} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="rgb(var(--cyan))">{dot.label}</text>
                <circle cx={dot.x} cy={dot.y} r="6" fill="rgb(var(--cyan))" filter="url(#rt-glow)" />
              </g>
            )}
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="glass flex-1 overflow-hidden rounded-3xl">
          <div className="border-b border-line/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Device log · UART2 115200</div>
          <ul className="space-y-1.5 p-4 font-mono text-[11px] leading-relaxed" aria-live="polite">
            {log.map((l, i) => <li key={`${l}-${i}`} className={i === 0 ? "text-ink" : "text-muted"}>{l}</li>)}
          </ul>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Inter-task communication</div>
          <ul className="space-y-2 text-xs">
            {rtosIpc.map((m) => (
              <li key={m.id}><span className="font-mono text-cyan">{m.name}</span> <span className="text-muted">· {m.type}</span><div className="text-muted">{m.use}</div></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ───────── Resource charts ───────── */
function Resources() {
  const max = Math.max(...rtosTasks.map((t) => t.stack));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold">Task stacks</h3>
        <p className="mt-1 text-xs text-muted">Allocated (words) vs. measured high-water mark from <span className="font-mono">/api/debug</span>, sized with ~2× headroom.</p>
        <ul className="mt-5 space-y-3">
          {rtosTasks.map((t) => (
            <li key={t.id} className="grid grid-cols-[96px_1fr_70px] items-center gap-3 text-xs">
              <span className="font-mono">{t.name.split(" ")[0]}<span className="ml-1 text-muted">{t.prio !== null ? `p${t.prio}` : ""}</span></span>
              <div className="relative h-3 overflow-hidden rounded-full bg-line/10">
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-neon/40" initial={{ width: 0 }} whileInView={{ width: `${(t.stack / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
                {t.peak && <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan to-neon" initial={{ width: 0 }} whileInView={{ width: `${(t.peak / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} />}
              </div>
              <span className="text-right font-mono text-muted">{t.peak ? `${t.peak}/` : ""}{t.stack}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-4 font-mono text-[10px] text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-neon/40" />allocated</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-cyan" />measured peak</span>
        </div>
      </div>
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold">Free heap through a TLS handshake</h3>
        <p className="mt-1 text-xs text-muted">RSA-2048 + ECDHE on a 120 MHz core (~9 s). The handshake is stepped manually and each credential is freed as soon as it is no longer needed; record buffers shrink from ~4.4 KB to 512 B.</p>
        <div className="mt-6 flex h-44 items-end gap-6 border-b border-line/15 px-2">
          {rtosHeap.map((h) => (
            <div key={h.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-display text-xl font-semibold">{h.kb} KB</span>
              <motion.div className={`w-full max-w-[80px] rounded-t-lg ${h.kb < 10 ? "bg-gradient-to-t from-[#ff4d6d]/70 to-[#ffd84d]/70" : "bg-gradient-to-t from-neon/60 to-cyan/70"}`}
                initial={{ height: 0 }} whileInView={{ height: `${(h.kb / 36) * 120}px` }} viewport={{ once: true }} transition={{ duration: 1 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-6 px-2">{rtosHeap.map((h) => <span key={h.label} className="flex-1 text-center text-[11px] text-muted">{h.label}</span>)}</div>
        <p className="mt-4 text-[11px] text-muted">A handshake only starts with ≥ 29 KB free; low-memory failures retry instead of backing off.</p>
      </div>
    </div>
  );
}

/* ───────── Main ───────── */
export function FreeRtosShowcase() {
  const [ref, seen] = useOnceInView<HTMLDivElement>("300px");
  const [explode, setExplode] = useState(0.7);
  const [selected, setSelected] = useState<string | null>(null);
  const info = useMemo(() => {
    if (!selected) return [];
    if (selected === "front") return rtosHardware.filter((h) => h.id === "led" || h.id === "button");
    return rtosHardware.filter((h) => h.id === selected);
  }, [selected]);

  return (
    <section className="mt-14 space-y-12" aria-label="Firmware showcase">
      <div>
        <h2 className="eyebrow mb-2">Hardware · exploded 3D model</h2>
        <p className="mb-5 max-w-2xl text-sm text-muted">The Tuya 5-in-1 air-quality box running this firmware. Slide to take it apart and click a part for its pins and role. The dashed link is the UART between the TuyaMCU and the CB3S module.</p>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div ref={ref} className="relative h-[420px] overflow-hidden rounded-3xl border border-line/15 bg-bg sm:h-[520px]">
            <div className="grid-bg absolute inset-0 opacity-60" />
            {seen && <AirBoxScene explode={explode} selected={selected} onSelect={setSelected} />}
            <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span className="glass inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5"><MousePointerClick className="h-3 w-3 text-cyan" /> click a part · drag to rotate</span>
            </div>
            <label className="glass absolute inset-x-4 bottom-4 z-10 flex items-center gap-3 rounded-2xl px-4 py-3 sm:inset-x-auto sm:w-80">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Assembled</span>
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} className="flex-1 accent-[rgb(var(--cyan))]" aria-label="Exploded view" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Exploded</span>
            </label>
          </div>
          <div className="glass relative rounded-3xl p-5">
            <AnimatePresence mode="wait">
              {info.length ? (
                <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <button onClick={() => setSelected(null)} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:text-cyan"><X className="h-4 w-4" /></button>
                  {info.map((h) => (
                    <div key={h.id} className="mb-5 last:mb-0">
                      <h3 className="font-display text-lg font-semibold">{h.name}</h3>
                      <p className="mt-1.5 text-sm text-ink/90">{h.detail}</p>
                      <p className="mt-2 font-mono text-xs leading-relaxed text-cyan">{h.pins}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="parts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Parts</div>
                  <ul className="mt-3 space-y-1.5">
                    {[["cb3s", "CB3S Wi-Fi module"], ["mcu", "TuyaMCU board"], ["sensors", "Sensors"], ["front", "Front · LED P6 + button P26"], ["case", "Enclosure"]].map(([id, label]) => (
                      <li key={id}><button onClick={() => setSelected(id)} className="w-full rounded-xl border border-line/10 px-3 py-2 text-left text-sm hover:border-cyan/40 hover:text-cyan">{label}</button></li>
                    ))}
                  </ul>
                  <div className="mt-5 rounded-2xl border border-line/10 bg-bg/50 p-3 font-mono text-[10.5px] leading-relaxed text-muted">
                    <span className="text-cyan">cb3s/&lt;host&gt;/state</span><br />{`{"temp":24.6,"hum":40.7,"co2":368,`}<br />{` "tvoc":1,"ch2o":2,"rssi":-62}`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div>
        <h2 className="eyebrow mb-2">FreeRTOS architecture · interactive</h2>
        <p className="mb-5 max-w-2xl text-sm text-muted">Six application tasks, plus MQTT in the Arduino main task. Run a scenario to follow a message through queues, the mailbox, event bits and task notifications.</p>
        <TaskDiagram />
      </div>

      <Resources />

      <div className="glass rounded-3xl p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><ShieldCheck className="h-5 w-5 text-cyan" /> MQTT over mutual TLS</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {rtosTls.map((t) => <li key={t} className="flex gap-2.5 text-sm text-muted"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
