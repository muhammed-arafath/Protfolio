"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb, SunDim, Blinds, AirVent, Radar, Power, Minus, Plus, ChevronUp, ChevronDown, Square, X, Play,
  CheckCircle2, AlertTriangle, CircleDashed, MousePointerClick, DoorOpen, Layers,
} from "lucide-react";
import {
  knxById, knxDevices, knxGroups, knxTopology, knxAcTests, knxStatus, knxLayers, senders, telegramPath, travelMs,
  type KnxLayerId,
} from "@/content/knx";
import type { KnxPacket, KnxSim } from "@/components/three/KnxPanelScene";
import { useOnceInView } from "@/lib/hooks";

const KnxPanelScene = dynamic(() => import("@/components/three/KnxPanelScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted">loading 3D demo case…</div>,
});

type LogRow = { id: number; t: number; src: string; ga: string; name: string; dpt: string; value: string; kind: "Write" | "Response" };

const initialSim: KnxSim = {
  lights: [false, false, false, false],
  led: [0, 0, 0, 0],
  curtain: null,
  ac: { on: false, mode: 3, setpoint: 24, fan: 0, swing: false },
  door: false,
  presence: false,
  flash: {},
  irAt: 0,
};

const MODES = [{ v: 3, l: "Cool" }, { v: 9, l: "Fan" }, { v: 14, l: "Dry" }];
const FANS = [{ v: 0, l: "Auto" }, { v: 33, l: "Low" }, { v: 66, l: "Mid" }, { v: 100, l: "High" }];
const TABS = [
  { id: "lights", label: "Lights", icon: Lightbulb },
  { id: "led", label: "LED strips", icon: SunDim },
  { id: "shutter", label: "Shutter", icon: Blinds },
  { id: "ac", label: "AC", icon: AirVent },
  { id: "sensors", label: "Sensors", icon: Radar },
] as const;

export function KnxShowcase() {
  const [ref, seen] = useOnceInView<HTMLDivElement>("300px");
  const [sim, setSim] = useState<KnxSim>(initialSim);
  const [packets, setPackets] = useState<KnxPacket[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [layers, setLayers] = useState<Set<KnxLayerId>>(new Set(["bus", "aux", "ac230", "dc12"]));
  const [selected, setSelected] = useState<string | null>(null);
  const [sender, setSender] = useState("st");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("lights");
  const [running, setRunning] = useState(false);
  const seq = useRef(0);
  const t0 = useRef(0);
  const timers = useRef<number[]>([]);
  const simRef = useRef(sim);
  simRef.current = sim;

  useEffect(() => {
    t0.current = performance.now();
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  /** Put a telegram on the bus; `apply` runs when it reaches the receiver. */
  const telegram = useCallback(
    (o: { from: string; to: string; ga: string; name: string; dpt: string; value: string; kind?: "Write" | "Response"; apply?: (s: KnxSim) => KnxSim; delay?: number }) => {
      const go = () => {
        const id = ++seq.current;
        const dur = travelMs(o.from, o.to);
        const color = o.kind === "Response" ? "#4dff9a" : o.from === "tuya" ? "#ffd84d" : "#E8401C";
        setPackets((p) => [...p.slice(-16), { id, pts: telegramPath(o.from, o.to), start: performance.now(), dur, color }]);
        setLog((l) => [{ id, t: performance.now() - t0.current, src: knxById[o.from].ia ?? "", ga: o.ga, name: o.name, dpt: o.dpt, value: o.value, kind: o.kind ?? "Write" }, ...l].slice(0, 40));
        later(dur, () => {
          setSim((s) => {
            const n = o.apply ? o.apply(s) : s;
            return { ...n, flash: { ...n.flash, [o.to]: performance.now() }, irAt: o.to === "ir" ? performance.now() + 120 : n.irAt };
          });
        });
        later(dur + 400, () => setPackets((p) => p.filter((x) => x.id !== id)));
        return dur;
      };
      if (o.delay) later(o.delay, go);
      else go();
      return travelMs(o.from, o.to) + (o.delay ?? 0);
    },
    []
  );

  /** AC command → IR gateway, then the gateway answers on the status GA. */
  const acCommand = (ga: string, name: string, dpt: string, value: string, apply: (s: KnxSim) => KnxSim, statusGa: string, statusValue: (s: KnxSim) => string, from = sender) => {
    const dur = telegram({ from, to: "ir", ga, name, dpt, value, apply });
    later(dur + 250, () => {
      const s = simRef.current;
      telegram({ from: "ir", to: "st", ga: statusGa, name: `${name} status`, dpt, value: statusValue(s), kind: "Response" });
    });
    return dur + 250 + travelMs("ir", "st");
  };

  const ac = {
    power: (on: boolean, from?: string) => acCommand("3/0/1", "AC on/off", "1.001", on ? "1" : "0", (s) => ({ ...s, ac: { ...s.ac, on } }), "3/0/11", (s) => (s.ac.on ? "1" : "0"), from),
    mode: (m: number, from?: string) => acCommand("3/0/2", "AC mode", "20.105", String(m), (s) => ({ ...s, ac: { ...s.ac, mode: m } }), "3/0/13", (s) => String(s.ac.mode), from),
    setpoint: (v: number, from?: string) => acCommand("3/0/3", "AC setpoint", "9.001", `${v} °C`, (s) => ({ ...s, ac: { ...s.ac, setpoint: Math.min(30, Math.max(17, v)) } }), "3/0/12", (s) => `${s.ac.setpoint} °C`, from),
    fan: (v: number, from?: string) => acCommand("3/0/4", "AC fan speed", "5.001", `${v} %`, (s) => ({ ...s, ac: { ...s.ac, fan: v } }), "3/0/14", (s) => `${s.ac.fan} %`, from),
    swing: (on: boolean, from?: string) => acCommand("3/0/5", "AC swing", "1.017", on ? "1" : "0", (s) => ({ ...s, ac: { ...s.ac, swing: on } }), "3/0/15", (s) => (s.ac.swing ? "1" : "0"), from),
  };

  const light = (i: number, on: boolean, from = sender) =>
    telegram({ from, to: "sw", ga: `0/0/${i + 1}`, name: `light ${i + 1}`, dpt: "1.001", value: on ? "1" : "0", apply: (s) => ({ ...s, lights: s.lights.map((v, k) => (k === i ? on : v)) }) });

  const ledValue = (i: number, v: number) =>
    telegram({ from: sender, to: "dim", ga: `0/4/${i + 1}`, name: `LED ${"ABCD"[i]} brightness`, dpt: "5.001", value: `${v} %`, apply: (s) => ({ ...s, led: s.led.map((x, k) => (k === i ? v : x)) }) });

  const shutter = (dir: "up" | "down" | "stop") => {
    if (dir === "stop") {
      telegram({ from: sender, to: "sh", ga: "1/1/1", name: "shutter 1 stop", dpt: "1.007", value: "1", apply: (s) => ({ ...s, curtain: null }) });
      return;
    }
    const dur = telegram({ from: sender, to: "sh", ga: "1/0/1", name: "shutter 1 up/down", dpt: "1.008", value: dir === "up" ? "0 (up)" : "1 (down)", apply: (s) => ({ ...s, curtain: dir }) });
    later(dur + 4000, () => setSim((s) => (s.curtain === dir ? { ...s, curtain: null } : s)));
  };

  const allOff = () => {
    telegram({ from: sender, to: "sw", ga: "4/0/1", name: "all lights off", dpt: "1.001", value: "0", apply: (s) => ({ ...s, lights: [false, false, false, false] }) });
    telegram({ from: sender, to: "dim", ga: "4/0/1", name: "all lights off", dpt: "1.001", value: "0", apply: (s) => ({ ...s, led: [0, 0, 0, 0] }), delay: 60 });
  };

  const motionDetected = () => {
    telegram({ from: "pir", to: "st", ga: "2/0/1", name: "motion presence", dpt: "1.001", value: "1", apply: (s) => ({ ...s, presence: true }) });
    telegram({ from: "pir", to: "sw", ga: "0/0/1", name: "light 1", dpt: "1.001", value: "1", apply: (s) => ({ ...s, lights: [true, ...s.lights.slice(1)] }), delay: 150 });
    later(6000, () => setSim((s) => ({ ...s, presence: false })));
  };

  const door = (open: boolean) =>
    telegram({ from: "kiu", to: "st", ga: "2/1/1", name: "door contact", dpt: "1.019", value: open ? "1 (open)" : "0 (closed)", apply: (s) => ({ ...s, door: open }) });

  /** Runs the 7-step AC test from the commissioning guide. */
  const runAcTest = () => {
    if (running) return;
    setRunning(true);
    setTab("ac");
    const steps: (() => number)[] = [
      () => ac.power(true, "st"),
      () => ac.mode(3, "st"),
      () => ac.setpoint(24, "st"),
      () => ac.setpoint(15, "st"),
      () => ac.fan(100, "st"),
      () => ac.swing(true, "st"),
      () => ac.power(false, "st"),
    ];
    let t = 0;
    steps.forEach((step, i) => {
      later(t, () => step());
      t += 2600;
      if (i === steps.length - 1) later(t, () => setRunning(false));
    });
  };

  const toggleLayer = (id: KnxLayerId) =>
    setLayers((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const dev = selected ? knxById[selected] : null;
  const btn = "rounded-xl border border-line/15 bg-bg/40 px-3 py-2.5 text-sm transition-colors hover:border-cyan/40 hover:text-cyan disabled:opacity-40";
  const on = "!border-cyan/60 !bg-cyan/15 !text-cyan";

  return (
    <section className="mt-14" aria-labelledby="knx-sim">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="knx-sim" className="eyebrow">Interactive 3D demo case · KNX TP bus simulator</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            The demo case modelled from the wiring diagram. Send telegrams from the panel and watch them travel along the bus (through the line coupler when they come from the Tuya gateway) to the actuators. Click any device for its terminals, address and group addresses.
          </p>
        </div>
        <button onClick={runAcTest} disabled={running} className="btn btn-primary !px-4 !py-2 text-xs disabled:opacity-60">
          <Play className="h-3.5 w-3.5" /> {running ? "Running AC test…" : "Run AC test sequence"}
        </button>
      </div>

      {/* layer toggles */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"><Layers className="h-3.5 w-3.5 text-cyan" /> wiring</span>
        {knxLayers.map((l) => (
          <button key={l.id} onClick={() => toggleLayer(l.id)} aria-pressed={layers.has(l.id)} title={l.note}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-opacity ${layers.has(l.id) ? "border-line/25 text-ink" : "border-line/10 text-muted opacity-50"}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} /> {l.label}
          </button>
        ))}
        <span className="inline-flex items-center gap-2 px-2 text-xs text-muted"><span className="h-0.5 w-4 border-t border-dashed border-[#c48bff]" /> IR emitter CH2</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        {/* 3D */}
        <div ref={ref} className="relative h-[480px] overflow-hidden rounded-3xl border border-line/15 bg-bg sm:h-[600px] xl:h-[min(80vh,820px)]">
          {seen && <KnxPanelScene sim={sim} packets={packets} layers={layers} selected={selected} onSelect={setSelected} />}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <span className="glass inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5"><MousePointerClick className="h-3 w-3 text-cyan" /> click a device</span>
            <span className="glass hidden rounded-md px-2.5 py-1.5 sm:inline-flex">main line 1.0 · sub line 1.1</span>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex gap-3 font-mono text-[10px] text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#E8401C]" />write</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4dff9a]" />response</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ffd84d]" />via coupler</span>
          </div>

          <AnimatePresence>
            {dev && (
              <motion.aside key={dev.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                className="glass absolute inset-x-3 bottom-3 z-30 max-h-[65%] overflow-y-auto rounded-2xl p-5 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[330px]" aria-live="polite">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">{dev.n ? `#${dev.n} · ` : ""}{dev.role}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{dev.name}</h3>
                    <div className="mt-0.5 font-mono text-xs text-muted">{dev.model}</div>
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="Close device details" className="rounded-lg p-1.5 text-muted hover:bg-cyan/10 hover:text-cyan"><X className="h-4 w-4" /></button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/90">{dev.desc}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Address (plan)</dt><dd className="mt-0.5 font-mono text-cyan">{dev.ia ?? "—"}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Line</dt><dd className="mt-0.5">{dev.line === "main" ? "1.0 main" : dev.line === "sub" ? "1.1 sub" : "not on bus"}</dd></div>
                  {dev.iaNow && <div className="col-span-2"><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Current in ETS</dt><dd className="mt-0.5 font-mono">{dev.iaNow}</dd></div>}
                </dl>
                <div className="mt-4"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Terminals</div><p className="mt-1 text-sm text-ink/90">{dev.terminals}</p></div>
                {dev.gas && (
                  <div className="mt-4 flex flex-wrap gap-1.5">{dev.gas.map((g) => <span key={g} className="chip chip-accent normal-case tracking-normal">{g}</span>)}</div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Control panel */}
        <div className="glass flex flex-col rounded-3xl p-4 sm:p-5">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Send from</span>
            <select value={sender} onChange={(e) => setSender(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line/15 bg-bg/70 px-3 py-2 text-sm text-ink outline-none focus:border-cyan/60">
              {senders.map((s) => <option key={s.id} value={s.id}>{s.label} · {s.ia}</option>)}
            </select>
          </label>

          <div role="tablist" aria-label="Control groups" className="mt-4 grid grid-cols-5 gap-1 rounded-2xl border border-line/10 bg-bg/40 p-1">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} title={t.label}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] transition-colors ${tab === t.id ? "bg-cyan/15 text-cyan" : "text-muted hover:text-ink"}`}>
                <t.icon className="h-4 w-4" /> <span className="hidden sm:block">{t.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-[190px]">
            {tab === "lights" && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {sim.lights.map((v, i) => (
                    <button key={i} onClick={() => light(i, !v)} className={`${btn} ${v ? on : ""} flex items-center justify-between`}>
                      <span>Light {i + 1}</span><span className="font-mono text-[10px] opacity-70">0/0/{i + 1}</span>
                    </button>
                  ))}
                </div>
                <button onClick={allOff} className={`${btn} mt-2 w-full`}>All lights off · <span className="font-mono text-[11px]">4/0/1</span></button>
              </div>
            )}
            {tab === "led" && (
              <div className="space-y-3">
                {sim.led.map((v, i) => (
                  <LedSlider key={i} label={`LED ${"ABCD"[i]}`} ga={`0/4/${i + 1}`} value={v} onCommit={(nv) => ledValue(i, nv)} />
                ))}
                <p className="text-[11px] text-muted">Mean Well HDR-60-12 → ADLD-04/03.1 · keep total ≤ ~43 W</p>
              </div>
            )}
            {tab === "shutter" && (
              <div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => shutter("up")} className={`${btn} ${sim.curtain === "up" ? on : ""} flex flex-col items-center`}><ChevronUp className="h-5 w-5" />Up</button>
                  <button onClick={() => shutter("stop")} className={`${btn} flex flex-col items-center`}><Square className="h-4 w-4" />Stop</button>
                  <button onClick={() => shutter("down")} className={`${btn} ${sim.curtain === "down" ? on : ""} flex flex-col items-center`}><ChevronDown className="h-5 w-5" />Down</button>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted">Shutter 1 (CH A) · 1/0/1 up/down (DPT 1.008, 0 = up) · 1/1/1 stop. The curtain LED indicator lights red going up, green going down (travel shortened for the demo).</p>
              </div>
            )}
            {tab === "ac" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => ac.power(!sim.ac.on)} className={`${btn} ${sim.ac.on ? on : ""} flex items-center gap-2`}><Power className="h-4 w-4" />{sim.ac.on ? "On" : "Off"}</button>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => ac.setpoint(sim.ac.setpoint - 1)} className={btn} aria-label="Lower setpoint"><Minus className="h-4 w-4" /></button>
                    <span className="w-16 text-center font-display text-2xl font-semibold tabular-nums">{sim.ac.setpoint}°</span>
                    <button onClick={() => ac.setpoint(sim.ac.setpoint + 1)} className={btn} aria-label="Raise setpoint"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">{MODES.map((m) => <button key={m.v} onClick={() => ac.mode(m.v)} className={`${btn} !py-2 text-xs ${sim.ac.mode === m.v ? on : ""}`}>{m.l}</button>)}</div>
                <div className="grid grid-cols-4 gap-1.5">{FANS.map((f) => <button key={f.v} onClick={() => ac.fan(f.v)} className={`${btn} !px-1 !py-2 text-xs ${sim.ac.fan === f.v ? on : ""}`}>{f.l}</button>)}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => ac.swing(!sim.ac.swing)} className={`${btn} !py-2 text-xs ${sim.ac.swing ? on : ""}`}>Swing {sim.ac.swing ? "on" : "off"}</button>
                  <button onClick={() => ac.setpoint(15)} className={`${btn} !py-2 text-xs`} title="Test 4: below the 17 °C minimum">Send 15 °C (min test)</button>
                </div>
                <p className="text-[11px] text-muted">BTIRF-02 CH2 · writes 3/0/1–5, status back on 3/0/11–15</p>
              </div>
            )}
            {tab === "sensors" && (
              <div className="space-y-2">
                <button onClick={motionDetected} className={`${btn} ${sim.presence ? on : ""} flex w-full items-center gap-2`}><Radar className="h-4 w-4" />Walk into the room <span className="ml-auto font-mono text-[10px] opacity-70">2/0/1 + 0/0/1</span></button>
                <button onClick={() => door(!sim.door)} className={`${btn} ${sim.door ? on : ""} flex w-full items-center gap-2`}><DoorOpen className="h-4 w-4" />{sim.door ? "Close the door" : "Open the door"} <span className="ml-auto font-mono text-[10px] opacity-70">2/1/1</span></button>
                <p className="text-[11px] text-muted">PIR 1.1.6 switches light 1 directly · door contact reaches the bus through KI/U input 1 (1.1.5).</p>
              </div>
            )}
          </div>

          {/* Group monitor */}
          <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line/10 bg-bg/60">
            <div className="flex items-center justify-between border-b border-line/10 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Group monitor</span>
              <button onClick={() => setLog([])} className="font-mono text-[10px] text-muted hover:text-cyan">clear</button>
            </div>
            <div className="h-[190px] overflow-y-auto font-mono text-[10.5px] xl:h-auto xl:flex-1" aria-live="polite">
              {log.length === 0 && <p className="p-3 text-muted">No telegrams yet — use the controls above.</p>}
              {log.map((r) => (
                <div key={r.id + r.kind} className="grid grid-cols-[52px_48px_54px_1fr] gap-2 border-b border-line/5 px-3 py-1.5">
                  <span className="text-muted">{(r.t / 1000).toFixed(2)}s</span>
                  <span className={r.kind === "Response" ? "text-[#15803d]" : "text-ink/80"}>{r.src}</span>
                  <span className="text-cyan">{r.ga}</span>
                  <span className="truncate text-ink/90" title={`${r.name} · DPT ${r.dpt} · ${r.kind}`}>{r.value} <span className="text-muted">· {r.name}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">Simulation of the planned ETS6 configuration — not connected to a live bus.</p>

      <KnxReference />
    </section>
  );
}

function LedSlider({ label, ga, value, onCommit }: { label: string; ga: string; value: number; onCommit: (v: number) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const commit = () => v !== value && onCommit(v);
  return (
    <label className="block">
      <span className="flex justify-between text-xs"><span>{label} <span className="font-mono text-[10px] text-muted">{ga}</span></span><span className="font-mono text-cyan">{v}%</span></span>
      <input type="range" min={0} max={100} step={5} value={v} onChange={(e) => setV(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit}
        className="mt-1 w-full accent-[rgb(var(--cyan))]" aria-label={`${label} brightness`} />
    </label>
  );
}

/* ───────── Reference tabs ───────── */
function KnxReference() {
  const tabs = ["Project status", "Topology", "Group addresses", "AC test plan"] as const;
  const [t, setT] = useState<(typeof tabs)[number]>("Project status");
  const th = "px-3 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-muted";
  const td = "px-3 py-2.5 align-top";
  return (
    <div className="mt-12">
      <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto">
        {tabs.map((x) => (
          <button key={x} role="tab" aria-selected={t === x} onClick={() => setT(x)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${t === x ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-line/15 text-muted hover:text-ink"}`}>{x}</button>
        ))}
      </div>
      <div className="glass overflow-x-auto rounded-3xl">
        {t === "Project status" && (
          <ul className="divide-y divide-line/10">
            {knxStatus.map((s) => (
              <li key={s.item} className="flex gap-4 px-5 py-4">
                {s.state === "done" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#15803d]" /> : s.state === "warn" ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b45309]" /> : <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-muted" />}
                <div><div className="font-medium">{s.item}</div><div className="mt-0.5 text-sm text-muted">{s.note}</div></div>
              </li>
            ))}
          </ul>
        )}
        {t === "Topology" && (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line/10"><tr><th className={th}>Planned IA</th><th className={th}>Device</th><th className={th}>Line</th><th className={th}>Now</th><th className={th}>Action</th></tr></thead>
            <tbody className="divide-y divide-line/10">
              {knxTopology.map((r) => (
                <tr key={r.ia}><td className={`${td} font-mono text-cyan`}>{r.ia}</td><td className={td}>{r.device}</td><td className={`${td} text-muted`}>{r.line}</td><td className={`${td} font-mono text-muted`}>{r.now}</td><td className={`${td} text-muted`}>{r.action}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {t === "Group addresses" && (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line/10"><tr><th className={th}>GA</th><th className={th}>Name</th><th className={th}>DPT</th><th className={th}>Linked object</th></tr></thead>
            {knxGroups.map((g) => (
              <tbody key={g.main} className="divide-y divide-line/10">
                <tr><td colSpan={4} className="bg-bg2/60 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">{g.main}</td></tr>
                {g.rows.map((r) => (
                  <tr key={r.ga}>
                    <td className={`${td} whitespace-nowrap font-mono text-cyan`}>{r.ga}</td>
                    <td className={td}>{r.name} {r.isNew && <span className="ml-1 rounded bg-[#b45309]/12 px-1.5 py-0.5 font-mono text-[9px] text-[#b45309]">NEW</span>}</td>
                    <td className={`${td} font-mono text-muted`}>{r.dpt}</td>
                    <td className={`${td} text-muted`}>{r.link}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        )}
        {t === "AC test plan" && (
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-line/10"><tr><th className={th}>#</th><th className={th}>Write GA</th><th className={th}>Value</th><th className={th}>Expected at the AC</th><th className={th}>Expected on the bus</th></tr></thead>
            <tbody className="divide-y divide-line/10">
              {knxAcTests.map((r, i) => (
                <tr key={i}><td className={`${td} text-muted`}>{i + 1}</td><td className={`${td} font-mono text-cyan`}>{r.ga}</td><td className={td}>{r.value}</td><td className={td}>{r.ac}</td><td className={`${td} font-mono text-muted`}>{r.bus}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export const knxDeviceCount = knxDevices.length;
