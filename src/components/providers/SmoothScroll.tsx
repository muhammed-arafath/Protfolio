"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis, scrollToId } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Route all in-page anchor clicks through the smooth scroller.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#'], a[href^='/#']") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href")!;
      if (href.startsWith("/#") && window.location.pathname !== "/") return; // let Next navigate home
      const id = href.split("#")[1];
      if (id && scrollToId(id)) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    // Refresh → always start at the top (Home). A real link to /#section (e.g. "All projects"
    // from a project page) still scrolls to that section.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = nav?.type === "reload";
    const hash = window.location.hash.slice(1);
    if (isReload || !hash) {
      if (hash) history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    } else {
      setTimeout(() => scrollToId(hash), 400);
    }

    return () => {
      document.removeEventListener("click", onClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
