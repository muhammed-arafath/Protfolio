"use client";
import dynamic from "next/dynamic";
import { Languages } from "lucide-react";
import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Avatar } from "@/components/ui/Avatar";
import { useOnceInView } from "@/lib/hooks";

const EcosystemScene = dynamic(() => import("@/components/three/EcosystemScene"), { ssr: false });

export function About() {
  const [ref, seen] = useOnceInView<HTMLDivElement>();
  return (
    <section id="about" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="01" eyebrow="About Me" title={<>Engineering the <span className="text-gradient">connected</span> future.</>} />

        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            {profile.about.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="mb-5 text-base leading-[1.85] text-muted sm:text-[17px]">{p}</p>
              </Reveal>
            ))}

            <Reveal delay={0.15}>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {profile.strengths.map((s) => (
                  <div key={s.t} className="glass glass-hover rounded-2xl p-5">
                    <div className="mb-3 h-px w-8 bg-cyan" />
                    <h3 className="font-display text-sm font-semibold leading-snug">{s.t}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {profile.facts.map((f) => (
                  <div key={f.k} className="border-l border-line/15 pl-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{f.k}</dt>
                    <dd className="mt-1 text-sm text-ink">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  <Languages className="h-4 w-4 text-cyan" /> Languages
                </span>
                {profile.languages.map((l) => (
                  <span key={l} className="chip chip-accent normal-case tracking-normal">{l}</span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div ref={ref} className="glass relative aspect-square w-full overflow-hidden rounded-3xl lg:sticky lg:top-28">
              <div className="grid-bg absolute inset-0 opacity-70" />
              {seen && <EcosystemScene />}
              <div className="pointer-events-none absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">
                iot ecosystem · live model
              </div>
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-2xl border border-line/10 bg-bg/70 p-4 backdrop-blur-md">
                <Avatar size={52} />
                <div className="min-w-0">
                  <div className="font-display font-semibold">{profile.name}</div>
                  <div className="truncate text-xs text-muted">{profile.tagline}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line/10 bg-line/10 lg:grid-cols-4">
          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="bg-bg p-6 sm:p-8">
              <div className="font-display text-4xl font-semibold sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
