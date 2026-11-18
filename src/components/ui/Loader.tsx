"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { safeGet, safeSet } from "@/lib/storage";
import { profile } from "@/content/profile";

const BOOT = [
  "init  firmware.bootloader",
  "scan  wifi + ethernet links",
  "conn  mqtt://broker:1883",
  "sub   building/+/telemetry",
  "load  node-red flows",
  "sync  influxdb → grafana",
];

/** Engineering-style boot sequence. Shown once per session. */
export function Loader() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (safeGet("session", "booted") || reduce) {
      setShow(false);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const id = setInterval(() => setStep((s) => Math.min(BOOT.length, s + 1)), 230);
    const done = setTimeout(() => {
      setShow(false);
      safeSet("session", "booted", "1");
    }, 230 * BOOT.length + 450);
    return () => {
      clearInterval(id);
      clearTimeout(done);
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!show) document.documentElement.style.overflow = "";
  }, [show]);

  const pct = Math.round((step / BOOT.length) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Loading portfolio"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-bg"
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="relative w-[min(420px,88vw)]">
            <div className="mb-8 flex items-center gap-4">
              <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
                <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="rgb(var(--cyan))" strokeWidth="1.5" />
                <rect x="17" y="17" width="14" height="14" rx="2" fill="rgb(var(--neon) / .25)" stroke="rgb(var(--neon))" />
                {[14, 20, 26, 32].map((p) => (
                  <g key={p} stroke="rgb(var(--cyan) / .7)" strokeWidth="1.5">
                    <line x1={p + 0.5} y1="4" x2={p + 0.5} y2="10" />
                    <line x1={p + 0.5} y1="38" x2={p + 0.5} y2="44" />
                    <line x1="4" y1={p + 0.5} x2="10" y2={p + 0.5} />
                    <line x1="38" y1={p + 0.5} x2="44" y2={p + 0.5} />
                  </g>
                ))}
              </svg>
              <div>
                <div className="font-display text-lg font-semibold tracking-[0.2em]">{profile.logo}</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">system boot</div>
              </div>
            </div>
            <ul className="mb-6 h-[132px] space-y-1 font-mono text-xs text-muted">
              {BOOT.slice(0, step).map((l) => (
                <motion.li key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between">
                  <span>
                    <span className="text-neon">›</span> {l}
                  </span>
                  <span className="text-cyan">ok</span>
                </motion.li>
              ))}
            </ul>
            <div className="h-px w-full bg-line/20">
              <motion.div className="h-px bg-gradient-to-r from-neon to-cyan shadow-[0_0_12px_rgb(var(--cyan))]" animate={{ width: `${pct}%` }} transition={{ ease: "easeOut" }} />
            </div>
            <div className="mt-2 text-right font-mono text-[11px] text-cyan">{pct}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
