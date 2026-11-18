import type { ArchLayer } from "@/content/profile";

type Props = { layers: ArchLayer[]; vertical?: boolean; compact?: boolean; id: string; title?: string };

/**
 * Animated system-architecture diagram generated from a project's layers.
 * Nodes are laid out per layer; packets travel along every inter-layer link.
 */
export function ArchFlow({ layers, vertical = false, compact = false, id, title }: Props) {
  const maxNodes = Math.max(...layers.map((l) => l.nodes.length));
  const W = vertical ? Math.max(340, maxNodes * 142 + 24) : Math.max(640, 168 + (layers.length - 1) * 215);
  const H = vertical ? 120 + layers.length * 120 : compact ? 250 : 300;
  const bw = vertical ? 128 : 142;
  const bh = 34;
  const pad = vertical ? 60 : 84;

  const pos = layers.map((l, i) => {
    const main = layers.length === 1 ? (vertical ? H : W) / 2 : pad + (i * ((vertical ? H : W) - pad * 2)) / (layers.length - 1);
    return l.nodes.map((_, j) => {
      const span = vertical ? W : H;
      const gap = vertical ? bw + 14 : bh + 22;
      const cross = span / 2 + (j - (l.nodes.length - 1) / 2) * gap + (vertical ? 0 : 10);
      return vertical ? { x: cross, y: main } : { x: main, y: cross };
    });
  });

  const links: { d: string; k: string }[] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    pos[i].forEach((a, ai) =>
      pos[i + 1].forEach((b, bi) => {
        const d = vertical
          ? `M${a.x},${a.y + bh / 2} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y - bh / 2}`
          : `M${a.x + bw / 2},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x - bw / 2},${b.y}`;
        links.push({ d, k: `${i}-${ai}-${bi}` });
      })
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title ? `System architecture: ${title}` : "System architecture diagram"}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2={vertical ? "0" : "1"} y1="0" y2={vertical ? "1" : "0"}>
          <stop offset="0" stopColor="rgb(var(--neon))" />
          <stop offset="1" stopColor="rgb(var(--cyan))" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgb(var(--line) / .07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-grid)`} />

      {/* layer captions */}
      {layers.map((l, i) => {
        const p = pos[i][0];
        return vertical ? (
          <text key={l.name} x={12} y={p.y - bh / 2 - 10} fill="rgb(var(--cyan))" fontSize="9.5" fontFamily="var(--font-mono)" letterSpacing="1.5">
            {String(i + 1).padStart(2, "0")} · {l.name.toUpperCase()}
          </text>
        ) : (
          <text key={l.name} x={p.x} y={22} textAnchor="middle" fill="rgb(var(--cyan))" fontSize="9.5" fontFamily="var(--font-mono)" letterSpacing="1.5">
            {String(i + 1).padStart(2, "0")} · {l.name.toUpperCase()}
          </text>
        );
      })}

      {links.map((l, i) => (
        <g key={l.k}>
          <path d={l.d} fill="none" stroke="rgb(var(--line) / .18)" strokeWidth="1" />
          <path d={l.d} fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.4" strokeDasharray="3 9" opacity=".8">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
          </path>
          <circle r="2.8" fill="rgb(var(--cyan))" filter={`url(#${id}-glow)`}>
            <animateMotion dur={`${2.2 + (i % 4) * 0.35}s`} begin={`${(i % 5) * 0.3}s`} repeatCount="indefinite" path={l.d} />
          </circle>
        </g>
      ))}

      {layers.map((l, i) =>
        l.nodes.map((n, j) => {
          const p = pos[i][j];
          return (
            <g key={`${i}-${j}`}>
              <rect x={p.x - bw / 2} y={p.y - bh / 2} width={bw} height={bh} rx="8" fill="rgb(var(--bg2))" stroke="rgb(var(--cyan) / .35)" />
              <rect x={p.x - bw / 2} y={p.y - bh / 2} width="3" height={bh} rx="1.5" fill="rgb(var(--cyan))" />
              <text x={p.x + 2} y={p.y + 4} textAnchor="middle" fill="rgb(var(--ink))" fontSize={n.length > 19 ? 9.5 : 11} fontWeight="500">
                {n}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
