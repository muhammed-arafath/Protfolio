"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArchFlow } from "@/components/projects/ArchFlow";

export function Projects() {
  const [featured, ...rest] = projects;
  return (
    <section id="projects" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="03" eyebrow="Featured Projects" title={<>Delivered <span className="text-gradient">engineering work</span>.</>} intro="From a KNX building-management demo case and custom FreeRTOS firmware to IoT automation across 20 library branches, Riyadh Metro energy infrastructure and IT support for 110 bank branches." />

        {/* Featured */}
        <Reveal>
          <Link href={`/projects/${featured.slug}`} className="glass glass-hover group grid overflow-hidden rounded-3xl lg:grid-cols-[1.25fr_1fr]" aria-label={`View project: ${featured.title}`}>
            <div className="relative border-b border-line/10 bg-bg2/60 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">system architecture</div>
              <div className="pt-6"><ArchFlow id="feat" layers={featured.architecture} title={featured.title} /></div>
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex flex-wrap gap-1.5"><span className="chip chip-accent">{featured.badge}</span>{featured.status && <span className="chip border-[#b45309]/30 bg-[#b45309]/10 text-[#b45309]">{featured.status}</span>}</span>
                <span className="font-display text-5xl font-bold text-line/10">{featured.num}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl">{featured.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{featured.summary}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {featured.tech.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{featured.scale} · {featured.location}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-cyan">{featured.showcase ? "Explore in 3D" : "View Project"} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </div>
            </div>
          </Link>
        </Reveal>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.06}>
              <Link href={`/projects/${p.slug}`} className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-3xl" aria-label={`View project: ${p.title}`}>
                <div className="relative border-b border-line/10 bg-bg2/60 px-3 pb-2 pt-3">
                  <ArchFlow id={`c-${p.slug}`} layers={p.architecture} compact title={p.title} />
                  <span className="absolute right-4 top-3 font-display text-4xl font-bold text-line/10">{p.num}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className={`chip w-fit ${p.domain === "automation" ? "chip-accent" : ""}`}>{p.badge}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{p.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">{p.scale}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan">{p.showcase ? "Explore in 3D" : "View Project"} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
