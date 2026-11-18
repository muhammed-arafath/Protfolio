import {
  Home, Workflow, Cpu, Plug, Code2, Terminal, Database, BarChart3, Radio, Wrench, Box, Shuffle, KeyRound,
  GitBranch, LayoutTemplate, Server, Network, ShieldCheck, Monitor, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  home: Home, workflow: Workflow, cpu: Cpu, plug: Plug, code: Code2, terminal: Terminal, database: Database,
  chart: BarChart3, radio: Radio, wrench: Wrench, box: Box, shuffle: Shuffle, key: KeyRound, git: GitBranch,
  layout: LayoutTemplate, server: Server, network: Network, shield: ShieldCheck, monitor: Monitor,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const I = map[name] ?? Cpu;
  return <I className={className} aria-hidden />;
}
