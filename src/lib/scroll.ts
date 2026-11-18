import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: id === "home" ? 0 : -72, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Keep the address bar clean (no #section) so a refresh always starts at Home.
  if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
  return true;
}
