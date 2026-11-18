"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Cpu, Activity, Workflow, Network, MapPin, Mail } from "lucide-react";
import { profile } from "@/content/profile";
import { Magnetic } from "@/components/ui/Magnetic";
import { Avatar } from "@/components/ui/Avatar";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HeroFallback } from "@/components/three/HeroFallback";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const panels = [
  { icon: Cpu, label: "Connected Devices", value: "ESP32 · CB3S · KNX", pos: "left-0 top-[8%] -translate-x-[12%]" },
  { icon: Activity, label: "Real-Time Data", value: "MQTT → InfluxDB → Grafana", pos: "right-0 top-[18%] translate-x-[6%]" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // fromTo with explicit start values: the scroll effect can never "remember" a hidden state.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.fromTo(left.current, { yPercent: 0, opacity: 1 }, { yPercent: -14, opacity: 0, ease: "none", immediateRender: false, scrollTrigger: st });
      gsap.fromTo(right.current, { yPercent: 0, scale: 1, opacity: 1 }, { yPercent: -6, scale: 0.96, opacity: 0.2, ease: "none", immediateRender: false, scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="home" aria-label="Introduction" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 lg:pb-10 lg:pt-24">
      {/* soft brand glows */}
      <div className="pointer-events-none absolute -right-[10%] top-[5%] h-[70vh] w-[55vw] rounded-full bg-neon/10 blur-[140px]" />
      <div className="pointer-events-none absolute -left-[15%] bottom-[-10%] h-[50vh] w-[45vw] rounded-full bg-violet/10 blur-[140px]" />

      <div className="container-site relative grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 xl:gap-12">
        {/* ── LEFT: text ── */}
        <div ref={left} className="relative z-10 order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.2 }} className="mb-7 flex flex-wrap items-center gap-3">
            <Avatar size={52} className="!border-2 !border-neon/40 shadow-[0_8px_30px_-8px_rgb(var(--neon)/0.5)]" />
            <div>
              <div className="font-display text-base font-semibold">{profile.name}</div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neon">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-neon" />
                {profile.company} · since {profile.companySince}
              </div>
            </div>
          </motion.div>

          <h1 className="font-display text-[clamp(2.3rem,9.5vw,4rem)] lg:text-[clamp(2.8rem,4.1vw,5.4rem)] font-semibold uppercase leading-[0.92] tracking-tight">
            {profile.heroHeadline.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-2">
                <motion.span className={`block ${i === 1 ? "text-gradient" : ""}`} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease, delay: 0.35 + i * 0.12 }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="mt-6 max-w-xl font-mono text-[11.5px] uppercase leading-relaxed tracking-[0.18em] text-neon sm:text-[13px]">
            {profile.heroSub}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.9, ease }} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {profile.heroBio}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9, ease }} className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#projects" className="btn btn-primary">Explore My Projects <ArrowRight className="h-4 w-4" /></a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-ghost"><Mail className="h-4 w-4" /> Contact Me</a>
            </Magnetic>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }} className="mt-12 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line/15 bg-line/10">
            {profile.stats.slice(0, 3).map((s) => (
              <div key={s.label} className="bg-bg/80 px-4 py-4 backdrop-blur sm:px-5">
                <div className="font-display text-2xl font-semibold sm:text-3xl">
                  {s.value}<span className="text-neon">{s.suffix}</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted"><MapPin className="h-3.5 w-3.5 text-neon" /> {profile.location}</div>
        </div>

        {/* ── RIGHT: 3D smart building ── */}
        <div
          className="relative order-1 aspect-[5/4] w-full animate-fadeScale sm:aspect-[4/3] lg:order-2 lg:aspect-auto lg:h-[min(82vh,860px)]"
          style={{ animationDelay: "0.15s" }}
        >
          <div ref={right} className="absolute inset-0">
          {/* stage rings */}
          <div className="pointer-events-none absolute inset-[6%] rounded-full border border-neon/10" />
          <div className="pointer-events-none absolute inset-[16%] rounded-full border border-dashed border-neon/15" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--neon)/0.12),transparent_65%)]" />

          {/* instant placeholder → fades out once the 3D scene has rendered */}
          <HeroFallback className={`pointer-events-none absolute inset-[8%] h-[84%] w-[84%] transition-opacity duration-700 ${ready ? "opacity-0" : "animate-pulse opacity-80"}`} />
          <div className={`absolute inset-0 transition-opacity duration-700 [mask-image:radial-gradient(ellipse_62%_58%_at_50%_50%,black_62%,transparent_100%)] ${ready ? "opacity-100" : "opacity-0"}`}>
            <HeroScene light={theme === "light"} onReady={() => setReady(true)} />
          </div>

          {/* holographic panels around the model */}
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
            {panels.map((p, i) => (
              <div key={p.label} className={`absolute ${p.pos}`}>
                <div className="glass relative w-52 animate-fadeUp overflow-hidden rounded-2xl px-4 py-3 shadow-[0_20px_50px_-25px_rgb(var(--accent)/0.45)]" style={{ animationDelay: `${0.9 + i * 0.15}s` }}>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neon"><p.icon className="h-3.5 w-3.5" /> {p.label}</div>
                  <div className="mt-1.5 text-xs text-ink/80">{p.value}</div>
                  <div className="mt-2.5 flex h-5 items-end gap-[3px]">
                    {Array.from({ length: 22 }).map((_, k) => (
                      <span key={k} className="w-[3px] origin-bottom animate-pulseDot rounded-sm bg-gradient-to-t from-neon to-violet" style={{ height: `${25 + ((k * 37 + i * 11) % 70)}%`, animationDelay: `${(k % 7) * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      <a href="#about" aria-label="Scroll to About section" className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted transition-colors hover:text-neon lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="relative flex h-10 w-6 justify-center overflow-hidden rounded-full border border-line/30">
          <span className="mt-2 h-2 w-0.5 animate-bounce rounded bg-neon" />
        </span>
      </a>
    </section>
  );
}
