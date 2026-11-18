"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Pause, Play, RotateCcw, X, ZoomIn, ChevronRight } from "lucide-react";
import { labDevices, labLinks, labStages } from "@/content/lab";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useOnceInView, useReducedMotion } from "@/lib/hooks";

const LabScene = dynamic(() => import("@/components/three/LabScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted">loading 3D lab…</div>,
});

export function IoTLab() {
  const [ref, seen] = useOnceInView<HTMLDivElement>("300px");
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  const device = useMemo(() => labDevices.find((d) => d.id === selected) ?? null, [selected]);
  const neighbours = useMemo(() => {
    if (!selected) return { up: [], down: [] } as { up: string[]; down: string[] };
    const name = (id: string) => labDevices.find((d) => d.id === id)!.name;
    return {
      up: labLinks.filter(([, b]) => b === selected).map(([a]) => name(a)),
      down: labLinks.filter(([a]) => a === selected).map(([, b]) => name(b)),
    };
  }, [selected]);

  // Guided data-flow tour: step through each stage.
  useEffect(() => {
    if (!playing) return;
    setSelected(null);
    setStage((s) => (s === null ? 0 : s));
    const id = setInterval(() => setStage((s) => ((s ?? -1) + 1) % labStages.length), reduce ? 2600 : 1700);
    return () => clearInterval(id);
  }, [playing, reduce]);

  const pickStage = (i: number) => {
    setPlaying(false);
    setSelected(null);
    setStage((s) => (s === i ? null : i));
  };
  const pickDevice = (id: string | null) => {
    setPlaying(false);
    setSelected(id);
    if (id) setStage(null);
  };
  const reset = () => {
    setPlaying(false);
    setSelected(null);
    setStage(null);
  };

  return (
    <section id="lab" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading
          index="04"
          eyebrow="Interactive 3D IoT Lab"
          title={<>Follow the data, <span className="text-gradient">sensor to dashboard</span>.</>}
          intro="The pipeline I build at Inseejam, as an explorable 3D lab. Drag to rotate, scroll or pinch to zoom, and select any device to see what it does, how it talks and where its data goes."
        />

        {/* Flow stepper */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setPlaying((p) => !p)} className="btn btn-primary !px-4 !py-2 text-xs" aria-pressed={playing}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {playing ? "Pause flow" : "Play data flow"}
          </button>
          <button onClick={reset} className="btn btn-ghost !px-3 !py-2 text-xs" aria-label="Reset lab view">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <ol className="mb-5 flex gap-1 overflow-x-auto pb-1" aria-label="Data flow stages">
          {labStages.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center">
              <button
                onClick={() => pickStage(i)}
                aria-pressed={stage === i}
                className={`rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-all ${
                  stage === i ? "border-cyan/60 bg-cyan/15 text-cyan shadow-[0_0_24px_-6px_rgb(var(--cyan))]" : "border-line/15 text-muted hover:border-cyan/30 hover:text-ink"
                }`}
              >
                <span className="mr-1.5 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </button>
              {i < labStages.length - 1 && <ChevronRight className={`mx-0.5 h-3.5 w-3.5 ${stage !== null && i < stage ? "text-cyan" : "text-line/30"}`} />}
            </li>
          ))}
        </ol>

        <div ref={ref} className="relative h-[560px] overflow-hidden rounded-3xl border border-line/15 bg-bg sm:h-[680px] lg:h-[min(82vh,860px)]">
          {seen && <LabScene selected={selected} onSelect={pickDevice} activeStage={stage} />}

          <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <span className="glass inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5"><MousePointerClick className="h-3 w-3 text-cyan" /> select device</span>
            <span className="glass hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 sm:inline-flex"><ZoomIn className="h-3 w-3 text-cyan" /> drag · zoom</span>
          </div>

          {/* Stage caption during tour */}
          <AnimatePresence>
            {stage !== null && !device && (
              <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass absolute bottom-4 left-4 right-4 z-20 rounded-2xl p-4 sm:right-auto sm:max-w-sm">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">stage {String(stage + 1).padStart(2, "0")} · {labStages[stage]}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {labDevices.filter((d) => d.stage === stage).map((d) => (
                    <button key={d.id} onClick={() => pickDevice(d.id)} className="chip chip-accent hover:bg-cyan/20">{d.name}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Device info panel */}
          <AnimatePresence>
            {device && (
              <motion.aside
                key={device.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="glass absolute inset-x-3 bottom-3 z-20 max-h-[62%] overflow-y-auto rounded-2xl p-5 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[340px]"
                aria-live="polite"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">stage {String(device.stage + 1).padStart(2, "0")} · {labStages[device.stage]}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{device.name}</h3>
                  </div>
                  <button onClick={() => pickDevice(null)} aria-label="Close device details" className="rounded-lg p-1.5 text-muted hover:bg-cyan/10 hover:text-cyan">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 space-y-3.5 text-sm">
                  {[
                    ["Function", device.fn],
                    ["Protocol", device.protocol],
                    ["Typical application", device.application],
                    ["Connection to the ecosystem", device.connection],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{k}</dt>
                      <dd className={`mt-1 leading-relaxed ${k === "Protocol" ? "font-mono text-[13px] text-cyan" : "text-ink/90"}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                {(neighbours.up.length > 0 || neighbours.down.length > 0) && (
                  <div className="mt-4 border-t border-line/10 pt-4 text-xs text-muted">
                    {neighbours.up.length > 0 && <p><span className="text-cyan">←</span> from: {neighbours.up.join(", ")}</p>}
                    {neighbours.down.length > 0 && <p className="mt-1"><span className="text-cyan">→</span> to: {neighbours.down.join(", ")}</p>}
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Accessible / non-3D index of devices */}
        <details className="mt-4 rounded-2xl border border-line/10 p-4 text-sm text-muted">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.18em] text-ink">All devices in the lab ({labDevices.length})</summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {labDevices.map((d) => (
              <button key={d.id} onClick={() => pickDevice(d.id)} className={`chip ${selected === d.id ? "chip-accent" : ""}`}>{d.name}</button>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
