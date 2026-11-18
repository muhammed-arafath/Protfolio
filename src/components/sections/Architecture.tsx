"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cable, AirVent, Lightbulb, Zap, Thermometer, Cctv, Network, Factory, BarChart3, ArrowUpRight, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

type Sys = { id: string; name: string; icon: LucideIcon; proto: string; how: string; devices: string[]; project?: { slug: string; label: string } };

/** Building systems I have actually integrated, around the central automation platform. */
const systems: Sys[] = [
  { id: "knx", name: "KNX · GVS devices", icon: Cable, proto: "KNX TP · ETS6", how: "GVS KNX devices (K-BUS actuators, IR gateway, sensors and touch panels) on a KNX twisted-pair bus, configured with the ETS6 software through a KNX-USB TP interface. A line coupler separates the main line and the sub line.", devices: ["Switch / dimmer / shutter actuators", "BTIRF-02 IR gateway", "Smart Touch V50s · WALTZ pad"], project: { slug: "knx-gvs-bms-demo-case", label: "KNX demo case" } },
  { id: "hvac", name: "AC / HVAC Control", icon: AirVent, proto: "IR · MQTT", how: "IR controllers send commands to split AC units while air-quality readings decide when to run them. Commands and telemetry travel over MQTT.", devices: ["IR AC controllers", "Air quality sensors", "ESP32 nodes"], project: { slug: "spl-palm-automation", label: "SPL — 20 branches" } },
  { id: "light", name: "Lighting & Switching", icon: Lightbulb, proto: "Wi-Fi · MQTT", how: "Tuya devices are re-flashed with OpenBeken / ESPHome (via Cloud Cutter) so lights and relays switch locally from the central platform, without depending on a vendor cloud.", devices: ["CB3S / BK7231N modules", "Smart relays", "Smart switches"] },
  { id: "energy", name: "Energy Monitoring", icon: Zap, proto: "MQTT · ThingsBoard", how: "Energy meters stream consumption into ThingsBoard and InfluxDB, and Grafana shows it live.", devices: ["Energy meter sensors", "ThingsBoard", "Grafana"], project: { slug: "spl-palm-automation", label: "SPL Batha branch" } },
  { id: "env", name: "Environmental Sensors", icon: Thermometer, proto: "ESPHome · MQTT", how: "ESP32 / ESP8266 nodes read temperature, humidity, light and motion, then publish states for automations and history.", devices: ["Temp / humidity", "PIR motion", "Light sensors"] },
  { id: "cctv", name: "CCTV & Surveillance", icon: Cctv, proto: "IP · Ethernet", how: "IP cameras record to NVR / DVR systems integrated on the site LAN, with regular health checks and fault replacement.", devices: ["IP cameras", "NVR / DVR", "PoE switching"], project: { slug: "coop-banks-ibank-support", label: "110 bank branches" } },
  { id: "net", name: "Network Infrastructure", icon: Network, proto: "Ethernet · VLAN · Wi-Fi", how: "Cisco routers, switches, VLANs, firewalls and access points give the building systems a segmented, secure network.", devices: ["Cisco routers / switches", "Access points", "Firewall"] },
  { id: "ind", name: "Industrial Control", icon: Factory, proto: "Fiber · RIO · PLC", how: "Field equipment such as exhaust fans and train detection connects through Remote I/O over a fiber backbone to the PLC room, which works with the MCC and DCP.", devices: ["MCC / DCP", "PLC room", "RIO modules"], project: { slug: "riyadh-metro-energy-fiber", label: "Riyadh Metro — 3 stations" } },
  { id: "mon", name: "Monitoring & Dashboards", icon: BarChart3, proto: "InfluxDB · HTTP", how: "Node-RED pushes data from the field devices into InfluxDB. Grafana and ThingsBoard dashboards then show trends and raise alerts.", devices: ["InfluxDB", "Grafana", "ThingsBoard"] },
];

const W = 820, H = 580, CX = W / 2, CY = H / 2, RX = 310, RY = 218;

export function Architecture() {
  const [active, setActive] = useState<string>("knx");
  const sys = systems.find((s) => s.id === active)!;

  return (
    <section id="architecture" className="section">
      <div className="section-divider" />
      <div className="container-site">
        <SectionHeading index="05" eyebrow="Smart Building Technology" title={<>One platform, <span className="text-gradient">every building system</span>.</>} intro="How the building systems I work with connect to PALM, the central automation platform, and the protocols on each link. Select a system to see how it works." />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl p-2 sm:p-4">
              <div className="grid-bg absolute inset-0 opacity-50" />
              <div className="relative overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H}`} className="relative h-auto w-full min-w-[640px] sm:min-w-0" role="group" aria-label="Building automation architecture diagram">
                <defs>
                  <radialGradient id="core-g"><stop offset="0" stopColor="rgb(var(--neon) / .45)" /><stop offset="1" stopColor="rgb(var(--neon) / 0)" /></radialGradient>
                </defs>
                <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="rgb(var(--line) / .12)" strokeDasharray="2 6" />
                <circle cx={CX} cy={CY} r="130" fill="url(#core-g)" />
                {systems.map((s, i) => {
                  const a = (i / systems.length) * Math.PI * 2 - Math.PI / 2;
                  const x = CX + Math.cos(a) * RX, y = CY + Math.sin(a) * RY;
                  const on = s.id === active;
                  const path = `M${x},${y} L${CX},${CY}`;
                  return (
                    <g key={s.id}>
                      <path d={path} stroke={on ? "rgb(var(--cyan))" : "rgb(var(--line) / .22)"} strokeWidth={on ? 1.8 : 1} strokeDasharray={on ? "5 7" : undefined}>
                        {on && <animate attributeName="stroke-dashoffset" from="24" to="0" dur=".8s" repeatCount="indefinite" />}
                      </path>
                      <circle r={on ? 4 : 2.5} fill="rgb(var(--cyan))" opacity={on ? 1 : 0.6}>
                        <animateMotion dur={`${on ? 1.4 : 2.6 + (i % 3) * 0.4}s`} repeatCount="indefinite" path={path} />
                      </circle>
                      {/* protocol tag on link */}
                      <g transform={`translate(${(x + CX) / 2}, ${(y + CY) / 2})`} opacity={on ? 1 : 0.55}>
                        <rect x={-s.proto.length * 3.1 - 8} y="-10" width={s.proto.length * 6.2 + 16} height="20" rx="10" fill="rgb(var(--bg))" stroke={on ? "rgb(var(--cyan) / .6)" : "rgb(var(--line) / .2)"} />
                        <text textAnchor="middle" y="3.5" fontSize="10" fontFamily="var(--font-mono)" fill={on ? "rgb(var(--cyan))" : "rgb(var(--muted))"}>{s.proto}</text>
                      </g>
                      <g
                        role="button"
                        tabIndex={0}
                        aria-pressed={on}
                        aria-label={s.name}
                        onClick={() => setActive(s.id)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(s.id))}
                        className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[rgb(var(--cyan))]"
                        data-cursor="hover"
                      >
                        <circle cx={x} cy={y} r="34" fill="rgb(var(--bg2))" stroke={on ? "rgb(var(--cyan))" : "rgb(var(--line) / .25)"} strokeWidth={on ? 2 : 1} />
                        {on && (
                          <circle cx={x} cy={y} r="34" fill="none" stroke="rgb(var(--cyan))" opacity=".5">
                            <animate attributeName="r" values="34;48;34" dur="2.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values=".5;0;.5" dur="2.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <s.icon x={x - 12} y={y - 12} width={24} height={24} color={on ? "rgb(var(--cyan))" : "rgb(var(--muted))"} strokeWidth={1.6} />
                        <text x={x} y={y + (Math.sin(a) > 0.3 ? 54 : -46)} textAnchor="middle" fontSize="12.5" fontWeight="600" fill={on ? "rgb(var(--ink))" : "rgb(var(--muted))"}>{s.name}</text>
                      </g>
                    </g>
                  );
                })}
                {/* core */}
                <g>
                  <rect x={CX - 92} y={CY - 46} width="184" height="92" rx="18" fill="rgb(var(--bg))" stroke="rgb(var(--cyan) / .6)" />
                  <text x={CX} y={CY - 14} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="2" fill="rgb(var(--cyan))">CENTRAL PLATFORM</text>
                  <text x={CX} y={CY + 10} textAnchor="middle" fontSize="22" fontWeight="800" letterSpacing="3" fill="rgb(var(--ink))">PALM</text>
                  <text x={CX} y={CY + 28} textAnchor="middle" fontSize="11" fill="rgb(var(--muted))">Central automation platform</text>
                </g>
              </svg>
              </div>
              <p className="relative mt-1 text-center font-mono text-[10px] text-muted sm:hidden">← swipe the diagram →</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass relative h-full overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
              <AnimatePresence mode="wait">
                <motion.div key={sys.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan">
                    <sys.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-semibold">{sys.name}</h3>
                  <div className="mt-2 font-mono text-xs text-cyan">{sys.proto}</div>
                  <p className="mt-4 leading-relaxed text-muted">{sys.how}</p>
                  <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Components</div>
                  <ul className="mt-2 space-y-2">
                    {sys.devices.map((d) => (
                      <li key={d} className="flex items-center gap-2.5 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-cyan" /> {d}</li>
                    ))}
                  </ul>
                  {sys.project && (
                    <Link href={`/projects/${sys.project.slug}`} className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:underline">
                      Used in: {sys.project.label} <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex flex-wrap gap-1.5 border-t border-line/10 pt-5 lg:hidden">
                {systems.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)} className={`chip ${s.id === active ? "chip-accent" : ""}`}>{s.name}</button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
