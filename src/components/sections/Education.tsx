"use client";
import { Award, BookOpen, ExternalLink, GraduationCap, ScrollText } from "lucide-react";
import { certifications, education, techStacks } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const icons = [GraduationCap, BookOpen, ScrollText];
const toneVar = { cyan: "--cyan", neon: "--neon", accent: "--accent" } as const;

export function Education() {
  return (
    <section id="education" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="08" eyebrow="Education & Certifications" title={<>Foundations & <span className="text-gradient">technical stacks</span>.</>} />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div className="space-y-4">
            {education.map((e, i) => {
              const I = icons[i % icons.length];
              return (
                <Reveal key={e.degree} delay={i * 0.06}>
                  <div className="glass glass-hover flex gap-5 rounded-3xl p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan"><I className="h-5 w-5" /></span>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">{e.year}</div>
                      <h3 className="mt-1 font-display text-lg font-semibold leading-snug">{e.degree}</h3>
                      <p className="mt-1 text-sm text-muted">{e.school}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="space-y-4">
            {techStacks.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="glass glass-hover rounded-3xl p-6">
                  <h3 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: `rgb(var(${toneVar[s.tone]}))` }}>
                    <span className="h-px w-5" style={{ background: `rgb(var(${toneVar[s.tone]}))` }} />
                    {s.title}
                  </h3>
                  <ul className="mt-4 divide-y divide-line/10">
                    {s.rows.map((r) => (
                      <li key={r} className="flex gap-3 py-2.5 text-sm text-muted">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: `rgb(var(${toneVar[s.tone]}))` }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {certifications.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold"><Award className="h-5 w-5 text-cyan" /> Certifications</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((c, i) => (
                <Reveal key={c.name} delay={(i % 3) * 0.06}>
                  <article className="glass glass-hover flex h-full flex-col overflow-hidden rounded-3xl">
                    {c.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt={`${c.name} certificate`} loading="lazy" className="aspect-[16/10] w-full border-b border-line/10 object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">{c.issuer} · {c.date}</div>
                      <h4 className="mt-2 font-display text-lg font-semibold">{c.name}</h4>
                      {c.credentialId && <p className="mt-1 font-mono text-xs text-muted">ID: {c.credentialId}</p>}
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-cyan hover:underline">
                          Verify credential <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
