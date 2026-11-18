"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Mail, Phone, MapPin, Linkedin, Github, Plane, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { profile } from "@/content/profile";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { useOnceInView } from "@/lib/hooks";
import { useTheme } from "@/components/providers/ThemeProvider";

const GlobeScene = dynamic(() => import("@/components/three/GlobeScene"), { ssr: false });

/**
 * Form delivery: if NEXT_PUBLIC_FORM_ENDPOINT is set (e.g. a Formspree URL) the form posts there.
 * Otherwise it opens the visitor's email client with the message pre-filled.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const channels = [
  { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: Phone, label: "Phone", value: profile.phone, href: profile.phoneHref },
  { icon: Linkedin, label: "LinkedIn", value: profile.linkedin.replace(/^https?:\/\//, ""), href: profile.linkedin },
  { icon: Github, label: "GitHub", value: profile.github.replace(/^https?:\/\//, ""), href: profile.github },
  { icon: MapPin, label: "Location", value: profile.location },
  { icon: Plane, label: "Visa Status", value: `${profile.visa} · ${profile.availability}` },
];

type Status = { kind: "idle" | "sending" | "ok" | "error"; msg?: string };

export function Contact() {
  const [ref, seen] = useOnceInView<HTMLDivElement>();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { theme } = useTheme();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      setStatus({ kind: "error", msg: "Please fill in your name, email and message." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setStatus({ kind: "error", msg: "Please enter a valid email address." });
      return;
    }

    if (ENDPOINT) {
      setStatus({ kind: "sending" });
      try {
        const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error();
        form.reset();
        setStatus({ kind: "ok", msg: "Message sent — I'll get back to you soon." });
      } catch {
        setStatus({ kind: "error", msg: `Couldn't send right now. Please email ${profile.email} directly.` });
      }
      return;
    }

    const subject = encodeURIComponent(`Portfolio enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`);
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name}\n${data.email}${data.company ? `\n${data.company}` : ""}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setStatus({ kind: "ok", msg: "Your email app should now be open with the message ready to send." });
  }

  const input =
    "w-full rounded-xl border border-line/15 bg-bg/60 px-4 py-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-cyan/60 focus:bg-bg/80";

  return (
    <section id="contact" className="section overflow-hidden">
      <div ref={ref} className="pointer-events-none absolute inset-0 opacity-50 lg:opacity-80" aria-hidden>
        <div className="absolute right-[-20%] top-1/2 h-[900px] w-[900px] -translate-y-1/2 lg:right-[-8%]">{seen && <GlobeScene light={theme === "light"} />}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/60 to-transparent" />

      <div className="section-divider" />
      <div className="container-site relative">
        <Reveal>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs text-neon">09</span>
            <span className="h-px w-10 bg-gradient-to-r from-cyan to-transparent" />
            <span className="eyebrow">Contact</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="max-w-3xl font-display text-4xl font-semibold uppercase leading-[1] tracking-tight sm:text-6xl">
            Let&apos;s connect <span className="text-gradient">the future.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Have a building automation, IoT or infrastructure project in mind? I&apos;m open to building automation, IoT / firmware engineering and IT infrastructure roles, and can join immediately with a transferable Iqama in KSA.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {channels.map((c) => {
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan"><c.icon className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{c.label}</span>
                      <span className="block break-words text-sm">{c.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="glass glass-hover flex items-center gap-3 rounded-2xl p-4">
                        {inner}
                      </a>
                    ) : (
                      <div className="glass flex items-center gap-3 rounded-2xl p-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <form onSubmit={onSubmit} noValidate className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8" aria-describedby="form-status">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Full name *</span>
                  <input name="name" required autoComplete="name" className={input} placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Email *</span>
                  <input name="email" type="email" required autoComplete="email" className={input} placeholder="you@company.com" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Company</span>
                <input name="company" autoComplete="organization" className={input} placeholder="Company name" />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Message *</span>
                <textarea name="message" required rows={5} className={`${input} resize-y`} placeholder="Tell me about the project or opportunity…" />
              </label>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button type="submit" disabled={status.kind === "sending"} className="btn btn-primary px-7 py-3.5 uppercase tracking-[0.14em] disabled:opacity-60">
                    {status.kind === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Start a Conversation
                  </button>
                </Magnetic>
                <p id="form-status" role="status" className={`flex items-center gap-2 text-sm ${status.kind === "error" ? "text-red-400" : "text-cyan"}`}>
                  {status.kind === "ok" && <CheckCircle2 className="h-4 w-4" />}
                  {status.kind === "error" && <AlertCircle className="h-4 w-4" />}
                  {status.msg}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
