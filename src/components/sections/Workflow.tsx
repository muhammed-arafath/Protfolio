"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workflow } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Workflow() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".wf-line", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: true } });
      gsap.fromTo(".wf-line-v", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: true } });
      gsap.from(".wf-card", { y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="06" eyebrow="Engineering Workflow" title={<>From site survey to <span className="text-gradient">live dashboard</span>.</>} />
        <div ref={root} className="relative">
          <div className="absolute left-0 right-0 top-[27px] hidden h-px bg-line/10 lg:block">
            <div className="wf-line h-px origin-left bg-gradient-to-r from-neon via-cyan to-accent shadow-[0_0_12px_rgb(var(--cyan))]" />
          </div>
          <div className="absolute bottom-0 left-[27px] top-0 w-px bg-line/10 lg:hidden">
            <div className="wf-line-v h-full w-px origin-top bg-gradient-to-b from-neon via-cyan to-accent" />
          </div>
          <ol className="grid gap-6 lg:grid-cols-5 lg:gap-4">
            {workflow.map((w) => (
              <li key={w.n} className="wf-card relative flex flex-col pl-20 lg:pl-0">
                <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/40 bg-bg font-mono text-sm text-cyan shadow-[0_0_30px_-8px_rgb(var(--cyan))] lg:relative">
                  {w.n}
                </div>
                <div className="glass glass-hover flex-1 rounded-2xl p-5 lg:mt-6">
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{w.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{w.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
