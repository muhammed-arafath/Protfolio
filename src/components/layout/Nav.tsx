"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { nav, profile } from "@/content/profile";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`mx-auto flex h-14 max-w-site items-center justify-between rounded-2xl px-4 transition-all duration-500 sm:px-5 ${
          scrolled || open ? "glass shadow-[0_10px_40px_-18px_rgb(0_0_0/0.6)]" : "border border-transparent"
        }`}
      >
        <a href={href("home")} className="group flex items-center gap-2.5" aria-label={`${profile.name} — home`}>
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-cyan/40 bg-cyan/10">
            <span className="h-2 w-2 rounded-sm bg-cyan shadow-[0_0_10px_rgb(var(--cyan))] transition-transform duration-500 group-hover:rotate-45" />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.28em]">{profile.logo}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const is = onHome && active === n.id;
            return (
              <li key={n.id}>
                <a
                  href={href(n.id)}
                  aria-current={is ? "true" : undefined}
                  className={`relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${is ? "text-ink" : "text-muted hover:text-cyan"}`}
                >
                  {is && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg border border-cyan/25 bg-cyan/10" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  {n.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-cyan/10 hover:text-cyan"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href={href("contact")} className="btn btn-primary hidden !px-4 !py-2 text-xs sm:inline-flex">
            Contact Me
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-cyan/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-auto mt-2 max-w-site rounded-2xl p-3 lg:hidden"
          >
            <ul className="grid gap-1">
              {nav.map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}>
                  <a
                    href={href(n.id)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${onHome && active === n.id ? "bg-cyan/10 text-cyan" : "text-ink"}`}
                  >
                    {n.label}
                    <span className="font-mono text-[10px] text-muted">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
