/** Lightweight isometric smart-building illustration — shown while the 3D scene loads, or when WebGL is unavailable. */
export function HeroFallback({ className = "" }: { className?: string }) {
  const floors = 12;
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Smart building illustration">
      <defs>
        <linearGradient id="hf-glass" x1="0" x2="1">
          <stop offset="0" stopColor="rgb(var(--ink))" stopOpacity="0.85" />
          <stop offset="1" stopColor="rgb(var(--ink))" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id="hf-glow"><stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0.35" /><stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="200" cy="318" rx="170" ry="52" fill="url(#hf-glow)" />
      <ellipse cx="200" cy="318" rx="150" ry="44" fill="none" stroke="rgb(var(--neon))" strokeOpacity="0.35" />
      <ellipse cx="200" cy="318" rx="95" ry="28" fill="none" stroke="rgb(var(--neon))" strokeOpacity="0.25" strokeDasharray="4 6" />
      {/* KAFD neighbour */}
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={`s${i}`} transform={`translate(0 ${-i * 15})`}>
          <path d="M104 304 l34 -12 l34 12 l-34 12 z" fill="rgb(var(--ink))" opacity="0.85" />
          <path d="M104 304 v10 l34 12 v-10 z" fill="rgb(var(--ink))" opacity="0.7" />
          <path d="M172 304 v10 l-34 12 v-10 z" fill="rgb(var(--neon))" opacity={0.25 + (i % 3) * 0.18} />
        </g>
      ))}
      {/* PIF Tower: podium, faceted shaft, crystal crown */}
      <path d="M140 312 l60 -20 l60 20 l-60 20 z" fill="rgb(var(--ink))" opacity="0.9" />
      <path d="M140 312 v14 l60 20 v-14 z" fill="rgb(var(--ink))" opacity="0.75" />
      <path d="M260 312 v14 l-60 20 v-14 z" fill="rgb(var(--neon))" opacity="0.55" />
      <path d="M168 300 L168 120 L200 108 L200 312 Z" fill="url(#hf-glass)" />
      <path d="M200 312 L200 108 L232 120 L232 300 Z" fill="rgb(var(--neon))" opacity="0.55" />
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <line x1="168" y1={290 - i * 11} x2="200" y2={302 - i * 11.6} stroke="rgb(var(--bg))" strokeOpacity="0.35" />
          <line x1="200" y1={302 - i * 11.6} x2="232" y2={290 - i * 11} stroke="rgb(var(--bg))" strokeOpacity="0.4" />
        </g>
      ))}
      <path d="M168 120 L204 44 L200 108 Z" fill="rgb(var(--ink))" opacity="0.8" />
      <path d="M200 108 L204 44 L232 120 Z" fill="rgb(var(--neon))" opacity="0.75" />
      <path d="M204 44 L200 108" stroke="rgb(var(--neon))" strokeWidth="1.5" />
    </svg>
  );
}
