"use client";
import { motion, type Variants } from "framer-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] } }),
};

export function Reveal({ children, delay = 0, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" | "article" }) {
  const C = motion[as];
  return (
    <C className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} custom={delay}>
      {children}
    </C>
  );
}
