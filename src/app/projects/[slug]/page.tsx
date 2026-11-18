import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Calendar, Layers, MapPin } from "lucide-react";
import { projects, profile } from "@/content/profile";
import { ArchFlow } from "@/components/projects/ArchFlow";
import { Footer } from "@/components/layout/Footer";
import { KnxShowcase } from "@/components/projects/KnxShowcase";
import { FreeRtosShowcase } from "@/components/projects/FreeRtosShowcase";

type Params = { slug: string };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: `${p.title} · ${profile.name}`, description: p.summary, url: `/projects/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const idx = projects.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const p = projects[idx];
  const next = projects[(idx + 1) % projects.length];

  const meta = [
    { icon: Building2, k: "Company", v: p.company },
    { icon: MapPin, k: "Location", v: p.location },
    { icon: Layers, k: "Scale", v: p.scale },
    ...(p.year ? [{ icon: Calendar, k: "Year", v: p.year }] : []),
  ];

  return (
    <>
      <main id="main" className="relative overflow-x-clip pt-28">
        <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[600px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-neon/10 blur-[120px]" />

        <article className="container-site relative">
          <Link href="/#projects" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted hover:text-cyan">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>

          <header className="mt-8 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="font-display text-5xl font-bold text-line/15">{p.num}</span>
              <span className="chip chip-accent">{p.badge}</span>
              {p.status && <span className="chip border-[#b45309]/30 bg-[#b45309]/10 text-[#b45309]">{p.status}</span>}
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{p.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{p.summary}</p>
          </header>

          <dl className={`mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line/10 bg-line/10 ${meta.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} ${meta.length === 3 ? "[&>*:last-child]:col-span-2 md:[&>*:last-child]:col-span-1" : ""}`}>
            {meta.map((m) => (
              <div key={m.k} className="bg-bg p-5">
                <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"><m.icon className="h-3.5 w-3.5 text-cyan" />{m.k}</dt>
                <dd className="mt-2 text-sm font-medium">{m.v}</dd>
              </div>
            ))}
          </dl>

          {p.showcase === "knx" && <KnxShowcase />}
          {p.showcase === "freertos" && <FreeRtosShowcase />}

          <section className="mt-12" aria-labelledby="arch">
            <h2 id="arch" className="eyebrow mb-4">System architecture</h2>
            <div className="glass overflow-hidden rounded-3xl p-3 sm:p-6">
              <div className="mx-auto hidden max-w-5xl sm:block"><ArchFlow id="detail-h" layers={p.architecture} title={p.title} /></div>
              <div className="mx-auto max-w-sm sm:hidden"><ArchFlow id="detail-v" layers={p.architecture} vertical title={p.title} /></div>
            </div>
          </section>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <section className="glass rounded-3xl p-7">
              <h2 className="eyebrow">Problem statement</h2>
              <p className="mt-4 leading-relaxed text-ink/90">{p.challenge}</p>
            </section>
            <section className="glass rounded-3xl p-7">
              <h2 className="eyebrow">Engineering solution</h2>
              <p className="mt-4 leading-relaxed text-ink/90">{p.solution}</p>
            </section>
          </div>

          <section className="mt-12" aria-labelledby="scope">
            <h2 id="scope" className="eyebrow mb-4">Technical details</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {p.scope.map((s, i) => (
                <div key={s.title} className="glass relative overflow-hidden rounded-3xl p-6">
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-cyan to-accent" />
                  <div className="font-mono text-[10px] text-muted">0{i + 1}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="tech">
            <h2 id="tech" className="eyebrow mb-4">Technologies used</h2>
            <div className="flex flex-wrap gap-2">
              {p.tech.map((t) => <span key={t} className="chip chip-accent px-3 py-1.5 text-xs">{t}</span>)}
            </div>
          </section>

          <nav className="mt-20 flex flex-col gap-4 border-t border-line/10 py-10 sm:flex-row sm:items-center sm:justify-between" aria-label="Project navigation">
            <Link href="/#contact" className="btn btn-ghost w-fit">Discuss a similar project</Link>
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Next project</span>
              <span className="mt-1 inline-flex items-center gap-2 font-display text-lg font-semibold group-hover:text-cyan">
                {next.title} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </nav>
        </article>
      </main>
      <Footer home={false} />
    </>
  );
}
