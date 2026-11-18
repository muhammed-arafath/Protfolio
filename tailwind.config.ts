import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        bg2: v("bg2"),
        card: v("card"),
        neon: v("neon"),
        cyan: v("cyan"),
        accent: v("accent"),
        violet: v("violet"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { site: "1680px" },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
        dash: { to: { strokeDashoffset: "0" } },
        fadeScale: { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
        scan: "scan 3.5s linear infinite",
        fadeScale: "fadeScale 1.2s cubic-bezier(0.16,1,0.3,1) both",
        fadeUp: "fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
