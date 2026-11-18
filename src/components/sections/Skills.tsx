"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { skillGroups, skills, type Skill, type SkillGroupId } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

const tone: Record<SkillGroupId, string> = { iot: "rgb(var(--neon))", devops: "rgb(var(--violet))", it: "rgb(var(--accent))" };

function SkillCard({ s }: { s: Skill }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
    ref.current.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    ref.current.style.setProperty("--my", `${(py + 0.5) * 100}%`);
  };
  const reset = () => ref.current && (ref.current.style.transform = "");
  const c = tone[s.group];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className="glass glass-hover group relative h-full overflow-hidden rounded-2xl p-5 transition-transform duration-200 ease-out will-change-transform"
        style={{ background: `radial-gradient(400px circle at var(--mx,50%) var(--my,0%), rgb(var(--cyan) / .08), transparent 45%), rgb(var(--glass) / var(--glass-a))` }}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border" style={{ borderColor: `color-mix(in srgb, ${c} 35%, transparent)`, background: `color-mix(in srgb, ${c} 10%, transparent)`, color: c }}>
            <Icon name={s.icon} className="h-5 w-5" />
          </span>
          {s.level !== undefined && <span className="font-mono text-[11px] text-muted" aria-label={`Self-assessed proficiency ${s.level} percent`}>{s.level}%</span>}
        </div>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: c }}>{s.category}</div>
        <h3 className="mt-1 font-display text-base font-semibold">{s.name}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.tags.map((t) => (
            <span key={t} className="rounded-md border border-line/10 bg-bg2/60 px-2 py-0.5 text-[11px] text-muted">{t}</span>
          ))}
        </div>
        {s.level !== undefined && (
          <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-line/10">
            <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${c}, rgb(var(--accent)))` }} initial={{ width: 0 }} whileInView={{ width: `${s.level}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Small diagram: how the three skill domains connect in a real deployment. */
function DomainDiagram({ active }: { active: SkillGroupId | "all" }) {
  const nodes = [
    { id: "iot" as const, x: 95, y: 92, label: "Devices & Firmware", sub: "ESP32 · CB3S · MQTT", up: true },
    { id: "devops" as const, x: 305, y: 92, label: "Platforms & Hosting", sub: "Docker · Nginx · Authentik", up: true },
    { id: "it" as const, x: 200, y: 182, label: "Network & Systems", sub: "Cisco · AD · Windows Server", up: false },
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 2]];
  const on = (id: SkillGroupId) => active === "all" || active === id;
  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="Diagram connecting devices and firmware, platforms and hosting, and network and systems">
      <defs>
        <linearGradient id="sk-edge" x1="0" x2="1"><stop offset="0" stopColor="rgb(var(--neon))" /><stop offset="1" stopColor="rgb(var(--cyan))" /></linearGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <g key={i}>
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="rgb(var(--line) / .2)" strokeWidth="1" />
          <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="url(#sk-edge)" strokeWidth="1.5" strokeDasharray="4 8" opacity={on(nodes[a].id) || on(nodes[b].id) ? 0.9 : 0.15}>
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite" />
          </line>
        </g>
      ))}
      {nodes.map((n) => (
        <g key={n.id} opacity={on(n.id) ? 1 : 0.35} style={{ transition: "opacity .4s" }}>
          <circle cx={n.x} cy={n.y} r="20" fill="rgb(var(--bg2))" stroke={tone[n.id]} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="5" fill={tone[n.id]} />
          <circle cx={n.x} cy={n.y} r="28" fill="none" stroke={tone[n.id]} strokeOpacity=".25">
            <animate attributeName="r" values="22;34;22" dur="3s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values=".4;0;.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={n.x} y={n.up ? n.y - 52 : n.y + 46} textAnchor="middle" fill="rgb(var(--ink))" fontSize="11" fontWeight="600">{n.label}</text>
          <text x={n.x} y={n.up ? n.y - 38 : n.y + 60} textAnchor="middle" fill="rgb(var(--muted))" fontSize="9" fontFamily="var(--font-mono)">{n.sub}</text>
        </g>
      ))}
    </svg>
  );
}

export function Skills() {
  const [filter, setFilter] = useState<SkillGroupId | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 8;
  const list = useMemo(() => (filter === "all" ? skills : skills.filter((s) => s.group === filter)), [filter]);
  const tabs = [{ id: "all" as const, short: "All", count: skills.length }, ...skillGroups.map((g) => ({ id: g.id, short: g.short, count: skills.filter((s) => s.group === g.id).length }))];

  return (
    <section id="skills" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <SectionHeading index="02" eyebrow="Technical Skills" title={<>Interactive <span className="text-gradient">engineering hub</span>.</>} intro="From firmware on a CB3S module to the reverse proxy in front of the dashboard — the stack I work with across building automation, self-hosted platforms and IT infrastructure." />
          <Reveal delay={0.1} className="mb-14 hidden lg:block">
            <div className="glass rounded-3xl p-4"><DomainDiagram active={filter} /></div>
          </Reveal>
        </div>

        <Reveal>
          <div role="tablist" aria-label="Filter skills by category" className="mb-8 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`relative rounded-full border px-4 py-2 text-sm transition-colors ${filter === t.id ? "border-cyan/40 text-cyan" : "border-line/15 text-muted hover:text-ink"}`}
              >
                {filter === t.id && <motion.span layoutId="skill-tab" className="absolute inset-0 -z-10 rounded-full bg-cyan/10" />}
                {t.short} <span className="ml-1 font-mono text-[11px] opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((s, i) => (
              <div key={s.name} className={!expanded && i >= LIMIT ? "hidden md:block" : undefined}>
                <SkillCard s={s} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length > LIMIT && (
          <button onClick={() => setExpanded((e) => !e)} className="btn btn-ghost mt-6 w-full md:hidden" aria-expanded={expanded}>
            {expanded ? "Show fewer skills" : `Show all ${list.length} skills`}
          </button>
        )}
        <p className="mt-6 font-mono text-[11px] text-muted">Percentages are self-assessed proficiency.</p>
      </div>
    </section>
  );
}
