"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { activity, experience } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Experience() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="07" eyebrow="Professional Experience" title={<>Career <span className="text-gradient">journey</span>.</>} intro="8+ years across four companies, starting in IT infrastructure and support and moving into building automation and IoT engineering." />

        <div ref={track} className="relative mx-auto max-w-6xl">
          {/* rail */}
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-line/15 md:left-[220px]">
            <motion.div style={{ scaleY: progress }} className="h-full w-px origin-top bg-gradient-to-b from-neon via-violet to-accent" />
          </div>

          <ol className="space-y-10">
            {experience.map((e) => (
              <li key={e.company} className="relative grid md:grid-cols-[220px_1fr]">
                <span className={`absolute left-[15px] top-8 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-neon bg-bg md:left-[220px] ${e.current ? "shadow-[0_0_0_6px_rgb(var(--neon)/0.15)]" : ""}`}>
                  {e.current && <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-neon" />}
                </span>
                {/* date column */}
                <div className="hidden pr-10 pt-6 text-right md:block">
                  <div className="md:sticky md:top-32">
                    <div className="font-display text-2xl font-semibold leading-tight">{e.period}</div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{e.location}</div>
                    {e.current && <span className="chip chip-accent mt-3">Current</span>}
                  </div>
                </div>
                {/* card */}
                <Reveal className="pl-10 md:pl-12">
                  <article className="glass glass-hover relative overflow-hidden rounded-3xl p-6 sm:p-8">
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-neon via-violet to-transparent" />
                    <div className="flex flex-wrap items-center gap-2 md:hidden">
                      {e.current && <span className="chip chip-accent">Current</span>}
                      <span className="chip">{e.period}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 md:mt-0">
                      <div>
                        <h3 className="font-display text-xl font-semibold sm:text-2xl">{e.role}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="inline-flex items-center gap-1.5 font-medium text-neon"><Briefcase className="h-3.5 w-3.5" />{e.company}</span>
                          <span className="inline-flex items-center gap-1.5 text-muted"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                        </div>
                      </div>
                    </div>
                    <ul className="mt-6 grid gap-x-8 gap-y-2.5 lg:grid-cols-2">
                      {e.items.map((it) => (
                        <li key={it} className="flex gap-3 text-sm leading-relaxed text-muted">
                          <span className="mt-2 h-1 w-3 shrink-0 rounded bg-neon/70" />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-1.5 border-t border-line/10 pt-5">
                      {e.tech.map((t) => <span key={t} className="chip">{t}</span>)}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {/* Activity log */}
        <Reveal className="mx-auto mt-20 max-w-6xl">
          <div className="glass overflow-hidden rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-cyan" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em]">Activity log · Inseejam</h3>
              </div>
              <span className="font-mono text-[11px] text-muted">recent work</span>
            </div>
            <ul>
              {activity.map((a) => (
                <li key={a.task} className="grid gap-2 border-b border-line/10 px-6 py-4 last:border-0 sm:grid-cols-[160px_1fr_auto] sm:items-center">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">{a.tool}</span>
                  <span className="text-sm">{a.task}</span>
                  <span className="font-mono text-xs text-muted">{a.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
