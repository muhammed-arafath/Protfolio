# Muhammed Arafath — 3D IoT & Building Automation Portfolio

Next.js 15 · TypeScript · Tailwind CSS · Three.js / React Three Fiber / Drei · Framer Motion · GSAP · Lenis · Lucide

## Run

```bash
npm install
npm run dev        # http://localhost:7510
npm run build && npm start   # also on port 7510
```

## Edit content

All text, projects, experience, skills and contact details are in **`src/content/profile.ts`**.
The 3D IoT Lab devices are in **`src/content/lab.ts`**.

- **Photo** — save it as `public/profile.jpg`. To pull the photo out of the old single-file HTML portfolio:
  `npm run photo -- path/to/old-portfolio.html`
- **Certifications** — add entries to `certifications` and the section appears automatically.
- **Site URL** (SEO, sitemap, OG) — set `NEXT_PUBLIC_SITE_URL=https://your-domain`.
- **Contact form** — by default it opens the visitor's email client pre-filled.
  To receive submissions directly, set `NEXT_PUBLIC_FORM_ENDPOINT` to a Formspree (or similar) URL.

## Structure

```
src/app/                    layout (SEO, fonts, theme), home page, /projects/[slug], sitemap, robots, OG image
src/components/sections/    Hero, About, Skills, Projects, IoTLab, Architecture, Workflow, Experience, Education, Contact
src/components/three/       HeroScene (smart tower), LabScene (interactive lab), GlobeScene, EcosystemScene
src/components/ui/          Loader, Cursor, Magnetic, Reveal, Counter, Avatar, Icon
```

## Performance & accessibility

- 3D scenes are code-split, mounted only when near the viewport, and paused off-screen.
- Phones/touch devices get fewer particles, lower DPR and no antialiasing.
- `prefers-reduced-motion` disables smooth scroll, loader, cursor and scene motion.
- Dark/light theme (persisted), skip link, keyboard-operable diagrams, ARIA labels, a non-3D device list in the lab.

## Deploy

Push to GitHub and import into Vercel (zero config), or run `npm run build && npm start` on any Node 18+ host.

## Docker (port 7510)

```bash
docker compose up -d --build     # http://localhost:7510
docker compose logs -f           # logs
docker compose down              # stop
```

After editing content, re-run `docker compose up -d --build`.
Optional build settings can go in a `.env` file next to `docker-compose.yml`:
`NEXT_PUBLIC_SITE_URL=https://your-domain` and `NEXT_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxx`.
