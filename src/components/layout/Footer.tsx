import { Github, Linkedin, Mail } from "lucide-react";
import { nav, profile } from "@/content/profile";

export function Footer({ home = true }: { home?: boolean }) {
  return (
    <footer className="relative border-t border-line/10 bg-bg2/50">
      <div className="glow-line absolute inset-x-0 top-0 h-px opacity-40" />
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
        <div>
          <div className="font-display text-lg font-bold tracking-[0.25em]">{profile.logo}</div>
          <p className="mt-2 text-sm text-muted">
            {profile.name} — {profile.title}
            <br />
            IoT · Firmware · IT Infrastructure · {profile.location}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4 md:grid-cols-2">
          {nav.map((n) => (
            <li key={n.id}>
              <a href={home ? `#${n.id}` : `/#${n.id}`} className="text-muted transition-colors hover:text-cyan">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          {[
            { href: profile.linkedin, label: "LinkedIn", I: Linkedin },
            { href: profile.github, label: "GitHub", I: Github },
            { href: `mailto:${profile.email}`, label: "Email", I: Mail },
          ].map(({ href, label, I }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              aria-label={label}
              className="glass glass-hover flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:text-cyan"
            >
              <I className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="container-site flex flex-col gap-2 border-t border-line/10 py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <span className="font-mono">Riyadh, KSA · Built with Next.js & Three.js</span>
      </div>
    </footer>
  );
}
