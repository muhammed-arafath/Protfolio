import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/content/profile";
import { ThemeProvider, themeScript } from "@/components/providers/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Loader } from "@/components/ui/Loader";
import { Nav } from "@/components/layout/Nav";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const title = `${profile.name} — Building Automation, IoT & BMS Engineer`;
const description =
  "Portfolio of Muhammed Arafath, Building Automation Engineer at Inseejam, Riyadh. Smart building automation, IoT system integration, ESP32 / CB3S firmware, MQTT, Node-RED, Home Assistant, InfluxDB, Grafana and IT infrastructure.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  keywords: [
    "IoT Engineer", "BMS Engineer", "Building Automation Engineer", "Smart Building Engineer", "IoT System Integration",
    "Building Management Systems", "Industrial IoT", "Home Assistant", "Node-RED", "ESP32", "ESPHome", "MQTT", "Riyadh",
    "Saudi Arabia", profile.name,
  ],
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: { type: "profile", title, description, url: "/", siteName: profile.name, locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EE" },
    { media: "(prefers-color-scheme: dark)", color: "#141110" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  worksFor: { "@type": "Organization", name: profile.company },
  address: { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
  email: `mailto:${profile.email}`,
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: ["Building Automation", "Internet of Things", "MQTT", "Home Assistant", "Node-RED", "ESP32", "InfluxDB", "Grafana", "Networking"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans">
        <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /><span className="a3" /></div>
        <a href="#main" className="sr-only z-[100] rounded-lg bg-neon px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <ThemeProvider>
          <Loader />
          <SmoothScroll />
          <Nav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
