"use client";
import { useEffect, useState, useRef, type RefObject } from "react";

export function useMediaQuery(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Phones / tablets / coarse pointers get the lighter 3D experience. */
let softwareGL: boolean | null = null;
/** True when the browser renders WebGL on the CPU (no GPU acceleration) — e.g. SwiftShader / llvmpipe. */
export function isSoftwareGL() {
  if (softwareGL !== null) return softwareGL;
  softwareGL = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const name = String(ext && gl ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "");
    softwareGL = /swiftshader|llvmpipe|software|basic render/i.test(name);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* ignore */
  }
  return softwareGL;
}

/** Phones, touch devices and CPU-rendered WebGL get the lighter 3D experience. */
export function useLowPower() {
  const small = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const [sw, setSw] = useState(false);
  useEffect(() => setSw(isSoftwareGL()), []);
  return small || sw;
}

/** True while the element is (near) the viewport — used to pause off-screen 3D. */
export function useInView<T extends Element>(rootMargin = "200px"): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}

/** Has the element ever been near the viewport — used to lazy-mount heavy scenes. */
export function useOnceInView<T extends Element>(rootMargin = "400px"): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, seen]);
  return [ref, seen];
}
