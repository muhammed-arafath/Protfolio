import { Reveal } from "./Reveal";

export function SectionHeading({ index, eyebrow, title, intro, align = "left" }: { index: string; eyebrow: string; title: React.ReactNode; intro?: string; align?: "left" | "center" }) {
  return (
    <div className={`mb-14 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <div className={`mb-5 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <span className="font-mono text-xs text-neon">{index}</span>
          <span className="h-px w-10 bg-gradient-to-r from-cyan to-transparent" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
