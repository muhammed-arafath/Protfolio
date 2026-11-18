"use client";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";

/** Shows /public/profile.jpg when present, otherwise a monogram. */
export function Avatar({ size = 72, className = "" }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // The image may fail before hydration attaches onError — check once mounted.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-cyan/30 bg-gradient-to-br from-neon/20 to-accent/20 ${className}`}
      style={{ width: size, height: size }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} src={profile.photo} alt={`Portrait of ${profile.name}`} className="h-full w-full object-cover object-top" onError={() => setFailed(true)} />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display font-bold text-cyan" style={{ fontSize: size * 0.32 }}>
          {profile.initials}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </div>
  );
}
