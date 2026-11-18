/**
 * KNX BMS demo case — GVS K-BUS devices, ETS6 project "TP".
 * Source: GVS KNX demo case guide + GVS KNX AC control guide (16 Nov 2026).
 * Positions are board coordinates used by the 3D panel (x: -5..5, y: -3..3.2).
 */

export type KnxRole = "Power" | "Actuator" | "Input" | "System" | "Load" | "Setup";
export type KnxKind =
  | "mcb" | "psu" | "din" | "meanwell" | "coupler" | "flush" | "touch" | "pad" | "pir"
  | "door" | "curtain" | "lamps" | "strips" | "learner" | "ac";

export type KnxDevice = {
  id: string;
  n: number | null; // number in the wiring diagram
  name: string;
  model: string;
  role: KnxRole;
  kind: KnxKind;
  line: "main" | "sub" | null; // KNX line it sits on (null = not a bus device)
  ia?: string; // planned individual address
  iaNow?: string; // current address in the ETS project
  units?: number; // DIN module width
  pos: [number, number];
  desc: string;
  terminals: string;
  gas?: string[];
};

export const knxDevices: KnxDevice[] = [
  { id: "mcb", n: 1, name: "Circuit Breaker", model: "CHINT NXB-63 C32 · 2-pole", role: "Power", kind: "mcb", line: null, units: 2, pos: [-4.45, 1.2], desc: "Main breaker that feeds 230 V to the whole panel. Trips on short circuit or overload.", terminals: "Top: 230 V in (L, N) · Bottom: L, N out to all devices" },
  { id: "psu1", n: 2, name: "KNX Power Supply 640 mA (PSU 1)", model: "K-BUS BBPS-02/640.1", role: "Power", kind: "psu", line: "sub", units: 4, pos: [-3.62, 1.2], desc: "Supplies 30 V bus power to the sub line. LEDs show how much current the line is using.", terminals: "⏚ N L · I1 red/black = bus 30 V (choke) · I2 yellow/white = aux 30 V · Reset > 0.5 s" },
  { id: "sw", n: 3, name: "Switch Actuator 4-fold", model: "K-BUS KA/R 0416.2 · 16 A × 4", role: "Actuator", kind: "din", line: "sub", ia: "1.1.1", iaNow: "1.2.1", units: 4, pos: [-2.5, 1.2], desc: "Relay that switches 4 circuits (lamps A–D) on/off. Front levers switch each channel by hand.", terminals: "Top 8 screws: A–D (L in + load out) · Bottom: KNX red/black", gas: ["0/0/1–4 light 1–4", "0/1/1–4 status (new)", "4/0/1 all lights off", "4/1/1 scene"] },
  { id: "dim", n: 4, name: "LED Dimming Actuator 4-fold", model: "K-BUS ADLD-04/03.1 · 12–24 V DC", role: "Actuator", kind: "din", line: "sub", ia: "1.1.2", units: 4, pos: [-1.38, 1.2], desc: "Dims 4 LED strips. OT = over-temperature, OV = over-voltage. Soft on/off 1 s, min/max 5 %/100 %.", terminals: "Top: A + + B C + + D · Bottom: + + + − − − 12 V in, KNX red/black", gas: ["0/2/1–4 switch", "0/3/1–4 relative dim", "0/4/1–4 brightness", "0/5/x status"] },
  { id: "sh", n: 5, name: "Shutter Actuator V2 4-fold", model: "K-BUS AWBS-04/06.2 · 6(4) A 230 V", role: "Actuator", kind: "din", line: "sub", ia: "1.1.3", iaNow: "1.0.5", units: 4, pos: [-0.26, 1.2], desc: "Drives curtain/shutter motors up and down — one motor per channel. Wind protect activated, position Up on bus recovery.", terminals: "Top: ▼A ▲A … ▼D ▲D · Bottom: L L N N 230 V, KNX red/black · Man. button", gas: ["1/0/1–4 up/down", "1/1/1–4 stop", "1/2/1–4 position", "1/3/1–4 position status", "1/4/1 wind alarm"] },
  { id: "mw", n: 6, name: "12 V Power Supply", model: "MEAN WELL HDR-60-12 · 12 V 4.5 A", role: "Power", kind: "meanwell", line: null, units: 4, pos: [0.86, 1.2], desc: "Switch-mode supply that turns 230 V AC into 12 V DC for the LED dimmer. Not a KNX device. Keep LED load ≤ ~43 W.", terminals: "Bottom: L, N in · Top: −V −V +V +V out · V.Adj 10.8–13.8 V (keep 12 V)" },

  { id: "lc", n: 7, name: "Line Coupler", model: "K-BUS BNLC-00/00.1", role: "System", kind: "coupler", line: "sub", ia: "1.1.0", iaNow: "1.1.1 (bus scan)", units: 2, pos: [-4.45, -0.75], desc: "Bridge between main line and sub line. Passes data, not power, and filters group telegrams with its filter table.", terminals: "Main line red/black · Sub line red/black · address always x.y.0" },
  { id: "psu2", n: 8, name: "KNX Power Supply 640 mA (PSU 2)", model: "K-BUS BBPS-02/640.1", role: "Power", kind: "psu", line: "main", units: 4, pos: [-3.62, -0.75], desc: "Bus power for the main line. Its I2 aux 30 V output powers the Tuya gateway, Smart Touch and WALTZ pad.", terminals: "⏚ N L · I1 red/black = main-line bus · I2 yellow/white = aux 30 V" },
  { id: "tuya", n: 9, name: "KNX / Tuya-Zigbee Gateway 2.0", model: "K-BUS BTMO-TY/00.3", role: "System", kind: "din", line: "main", ia: "1.0.10", iaNow: "1.1.10", units: 4, pos: [-2.5, -0.75], desc: "Lets the Tuya / Smart Life app control the KNX system and adds Zigbee wireless devices.", terminals: "DC 12–30 V (yellow/white) · KNX 21–30 V (red/black) · LAN · antenna", gas: ["Not configured yet — to do"] },
  { id: "ir", n: 13, name: "KNX IR Gateway flush 2-fold", model: "K-BUS BTIRF-02/00.2", role: "Actuator", kind: "flush", line: "sub", ia: "1.1.4", iaNow: "3.1.1", pos: [-1.05, -0.75], desc: "Acts like the AC remote: a KNX telegram makes it send the learned IR code. CH2 = air-condition control, min. setpoint 17 °C, status response enabled. Up to 300 IR codes.", terminals: "IR emitter CH1, CH2 · KNX red/black · bus powered · emitter max 10 m, IR range 2 m", gas: ["3/0/1 on/off · 3/0/2 mode", "3/0/3 setpoint · 3/0/4 fan", "3/0/5 swing", "3/0/11–15 status"] },
  { id: "kiu", n: 14, name: "Universal Interface 4-fold", model: "K-BUS KI/U 0401.1", role: "Input", kind: "flush", line: "sub", ia: "1.1.5", pos: [-0.1, -0.75], desc: "Connects ordinary switches or contacts to KNX. 4 inputs and 4 LED outputs. No external voltage on inputs.", terminals: "KNX red/black · input cable 1–4 + COM · LED connector", gas: ["2/1/1 door contact"] },

  { id: "st", n: 10, name: "Smart Touch V50s", model: "GVS KNX touch panel", role: "Input", kind: "touch", line: "sub", ia: "1.1.7", iaNow: "1.2.3 (bus scan)", pos: [3.55, 1.25], desc: "Touch screen to control lights, dimming, curtains and AC from one place — ready AC/thermostat page.", terminals: "KNX red/black + aux 30 V yellow/white (display needs extra power)" },
  { id: "waltz", n: 11, name: "WALTZ Touch+ Pad", model: "GVS glass keypad · 3 keys", role: "Input", kind: "pad", line: "sub", ia: "1.1.8", pos: [2.15, 1.25], desc: "Wall keypad with display. Key 1 light 1, key 2 LED strip A (long = dim), key 3 shutter (short stop / long move).", terminals: "KNX red/black + aux 30 V yellow/white" },
  { id: "pir", n: 12, name: "Brightness & Motion Detector", model: "Ceiling KNX PIR", role: "Input", kind: "pir", line: "sub", ia: "1.1.6", pos: [2.85, 2.6], desc: "Sends presence and room brightness (lux). Switches light 1 directly via 0/0/1 when someone enters.", terminals: "KNX red/black only", gas: ["2/0/1 presence", "2/0/2 brightness lux", "0/0/1 light 1"] },
  { id: "door", n: 15, name: "Door Contact", model: "Magnetic reed switch", role: "Input", kind: "door", line: null, pos: [0.85, -0.75], desc: "Changes state when the door opens; reaches the bus through the Universal Interface input 1.", terminals: "2 wires → KI/U input 1 + COM · potential-free" },

  { id: "curtain", n: 16, name: "Curtain LED Indicator", model: "Up (red) / Down (green)", role: "Load", kind: "curtain", line: null, pos: [1.15, 2.55], desc: "Stands in for a real curtain motor: red lights while moving up, green while moving down.", terminals: "Up ← ▲A · Down ← ▼A · return to N" },
  { id: "lamps", n: 17, name: "Lamps 230 V", model: "Loads on switch actuator A–D", role: "Load", kind: "lamps", line: null, pos: [-3.3, 2.55], desc: "Lights on switch actuator channels A–D.", terminals: "Live from channel output · neutral direct to N" },
  { id: "strips", n: 18, name: "LED Strips 12 V", model: "Loads on LED dimmer A–D", role: "Load", kind: "strips", line: null, pos: [-1.0, 2.55], desc: "LED strips controlled by the dimmer. Keep the total under about 43 W.", terminals: "Strip + to dimmer + · strip − to A/B/C/D" },
  { id: "btil", n: 19, name: "IR Learner", model: "K-BUS BTIL-01/00.2 · USB", role: "Setup", kind: "learner", line: null, pos: [-4.2, -2.35], desc: "Learns button codes from the original AC remote inside the IR DCA app in ETS6. Setup only — not on the KNX bus.", terminals: "USB to PC · remote 2–5 cm from the learner · test, then download to BTIRF-02" },
  { id: "ac", n: null, name: "Split AC (indoor unit)", model: "Controlled by IR from BTIRF-02 CH2", role: "Load", kind: "ac", line: null, pos: [3.0, -1.55], desc: "No KNX connection — the IR emitter on CH2 is stuck in front of the AC’s IR receiver window. The gateway remembers the last command and reports it as status.", terminals: "AC keeps its own 230 V supply · emitter on the IR window" },
];

export const knxById = Object.fromEntries(knxDevices.map((d) => [d.id, d])) as Record<string, KnxDevice>;

/** Bus geometry (board coordinates). */
export const BUS = { subY: 0.22, mainY: -1.75, coupler: "lc" };

/** Senders the visitor can choose in the simulator. */
export const senders = [
  { id: "st", label: "Smart Touch V50s", ia: "1.1.7" },
  { id: "waltz", label: "WALTZ Touch+ Pad", ia: "1.1.8" },
  { id: "tuya", label: "Tuya app → gateway", ia: "1.0.10" },
];

/** Planned topology (ETS6) — new vs. current address. */
export const knxTopology = [
  { ia: "1.0.10", device: "Tuya ZigBee Gateway BTMO-TY/00.3", line: "1.0 main", now: "1.1.10", action: "Move → download IA" },
  { ia: "1.1.0", device: "Line coupler BNLC-00/00.1", line: "1.0 ↔ 1.1", now: "1.1.1 (bus scan)", action: "New · download first" },
  { ia: "1.1.1", device: "Switch Actuator KA/R 0416", line: "1.1 sub", now: "1.2.1", action: "Move → IA + application" },
  { ia: "1.1.2", device: "LED Dimming Actuator ADLD-04/03.1", line: "1.1 sub", now: "—", action: "New" },
  { ia: "1.1.3", device: "Shutter Actuator AWBS-04/06.2", line: "1.1 sub", now: "1.0.5", action: "Move → IA + application" },
  { ia: "1.1.4", device: "IR Gateway BTIRF-02/00.2", line: "1.1 sub", now: "3.1.1", action: "Move → IA + application + DCA codes" },
  { ia: "1.1.5", device: "Universal Interface KI/U 0401.1", line: "1.1 sub", now: "—", action: "New" },
  { ia: "1.1.6", device: "Brightness & Motion Detector", line: "1.1 sub", now: "—", action: "New" },
  { ia: "1.1.7", device: "Smart Touch V50s", line: "1.1 sub", now: "1.2.3 (bus scan)", action: "Add in ETS → IA + application" },
  { ia: "1.1.8", device: "WALTZ Touch+ Pad (3 keys)", line: "1.1 sub", now: "—", action: "New" },
  { ia: "1.1.255", device: "GVS KNX-USB Interface (programming)", line: "1.1 sub", now: "USB 36ce:0001", action: "Interface address" },
];

/** 3-level group address plan. */
export const knxGroups: { main: string; rows: { ga: string; name: string; dpt: string; link: string; isNew?: boolean }[] }[] = [
  {
    main: "0 · Lighting",
    rows: [
      { ga: "0/0/1–4", name: "Light 1–4 switch", dpt: "1.001", link: "1.1.1 obj 4/18/32/46 · Output A–D" },
      { ga: "0/1/1–4", name: "Light 1–4 status", dpt: "1.001", link: "1.1.1 obj 3/17/31/45 · reply switch status", isNew: true },
      { ga: "0/2/1–4", name: "LED A–D on/off", dpt: "1.001", link: "1.1.2 Switch, CH A–D", isNew: true },
      { ga: "0/3/1–4", name: "LED A–D relative dim", dpt: "3.007", link: "1.1.2 Relative dimming", isNew: true },
      { ga: "0/4/1–4", name: "LED A–D brightness", dpt: "5.001", link: "1.1.2 Brightness value", isNew: true },
      { ga: "0/5/1–4 · 11–14", name: "LED A–D status (switch · value)", dpt: "1.001 · 5.001", link: "1.1.2 Status objects", isNew: true },
    ],
  },
  {
    main: "1 · Shutters",
    rows: [
      { ga: "1/0/1–4", name: "Shutter 1–4 up/down", dpt: "1.008", link: "1.1.3 obj 17/31/45/59" },
      { ga: "1/1/1–4", name: "Shutter 1–4 stop", dpt: "1.007", link: "1.1.3 obj 18/32/46/60" },
      { ga: "1/2/1–4", name: "Shutter 1–4 position", dpt: "5.001", link: "1.1.3 obj 15/29/43/57", isNew: true },
      { ga: "1/3/1–4", name: "Shutter 1–4 position status", dpt: "5.001", link: "1.1.3 obj 14/28/42/56", isNew: true },
      { ga: "1/4/1", name: "Wind alarm", dpt: "1.005", link: "1.1.3 obj 0 Wind protect", isNew: true },
    ],
  },
  {
    main: "2 · Sensors",
    rows: [
      { ga: "2/0/1", name: "Motion presence", dpt: "1.001", link: "1.1.6 Presence output", isNew: true },
      { ga: "2/0/2", name: "Room brightness lux", dpt: "9.004", link: "1.1.6 Brightness value", isNew: true },
      { ga: "2/1/1", name: "Door contact (1 = open)", dpt: "1.019", link: "1.1.5 Input 1", isNew: true },
    ],
  },
  {
    main: "3 · AC Control",
    rows: [
      { ga: "3/0/1", name: "AC on/off", dpt: "1.001", link: "1.1.4 obj 150 · Power on/off" },
      { ga: "3/0/2", name: "AC mode", dpt: "20.105", link: "1.1.4 obj 152 · Control mode" },
      { ga: "3/0/3", name: "AC setpoint", dpt: "9.001", link: "1.1.4 obj 151 · Setpoint adjustment" },
      { ga: "3/0/4", name: "AC fan speed", dpt: "5.001", link: "1.1.4 obj 153 · Fan speed" },
      { ga: "3/0/5", name: "AC swing", dpt: "1.017", link: "1.1.4 obj 154 · Swing / stop" },
      { ga: "3/0/11–15", name: "AC status (same order)", dpt: "same", link: "1.1.4 obj 157–161 · C R T" },
    ],
  },
  {
    main: "4 · Central / Scenes",
    rows: [
      { ga: "4/0/1", name: "All lights off", dpt: "1.001", link: "1.1.1 A–D + 1.1.2 A–D (extra links)", isNew: true },
      { ga: "4/0/2", name: "All shutters up/down", dpt: "1.008", link: "1.1.3 obj 17/31/45/59 (extra links)", isNew: true },
      { ga: "4/1/1", name: "Scene number", dpt: "17.001", link: "1.1.1 · 1.1.2 · 1.1.3 scene objects", isNew: true },
    ],
  },
];

/** AC test sequence (ETS Group Monitor). */
export const knxAcTests = [
  { ga: "3/0/1", value: "1", ac: "Beep, AC starts", bus: "3/0/11 = 1" },
  { ga: "3/0/2", value: "3 (Cool)", ac: "Mode changes to cool", bus: "3/0/13 = 3" },
  { ga: "3/0/3", value: "24", ac: "Display shows 24 °C", bus: "3/0/12 = 24" },
  { ga: "3/0/3", value: "15", ac: "Stays at 17 °C (minimum)", bus: "3/0/12 = 17" },
  { ga: "3/0/4", value: "100 %", ac: "Fan high", bus: "3/0/14 = 100 %" },
  { ga: "3/0/5", value: "1", ac: "Louvre starts swinging", bus: "3/0/15 = 1" },
  { ga: "3/0/1", value: "0", ac: "Beep, AC stops", bus: "3/0/11 = 0" },
];

/** Honest project status from the ETS project (16 Nov 2026). */
export const knxStatus: { item: string; state: "done" | "warn" | "todo"; note: string }[] = [
  { item: "ETS6 project “TP”", state: "done", note: "Office Building · 3-level GAs · ETS6 6.4.1 on Ubuntu (Wine)" },
  { item: "Programming interface", state: "done", note: "GVS KNX-USB Interface (TP) · IP tunnelling as backup" },
  { item: "Switch & shutter actuators", state: "done", note: "Application downloaded, linked to 0/0/x and 1/0/x · 1/1/x" },
  { item: "IR gateway parameters & GAs", state: "done", note: "CH2 = air-condition, 17 °C min, status + swing enabled, 10 GAs linked" },
  { item: "IR gateway download", state: "warn", note: "Address + application loaded · parameters & links not downloaded yet" },
  { item: "IR code learning (BTIL-01 + DCA)", state: "todo", note: "Blocked: DCA V2.1.2.8 does not support product data 3B5F — waiting for GVS file" },
  { item: "Two-line topology (1.0 / 1.1)", state: "todo", note: "Move devices to the planned addresses, coupler first" },
  { item: "New devices in ETS", state: "todo", note: "LED dimmer, KI/U, motion detector, Smart Touch, WALTZ pad" },
  { item: "Tuya-Zigbee gateway", state: "todo", note: "Pair in Tuya app, enable channels, link GAs, download" },
];

/** Wiring layers shown in the 3D panel. */
export const knxLayers = [
  { id: "bus", label: "KNX bus", color: "#3ddc84", note: "red + / black − · green cable" },
  { id: "aux", label: "Aux 30 V", color: "#ffd84d", note: "yellow + / white −" },
  { id: "ac230", label: "230 V", color: "#ff8a3d", note: "L / N" },
  { id: "dc12", label: "12 V DC", color: "#ff4d6d", note: "Mean Well → dimmer → strips" },
] as const;

export type KnxLayerId = (typeof knxLayers)[number]["id"];

/* ── Geometry helpers shared by the 3D panel and the simulator ── */

const HEIGHT: Partial<Record<KnxKind, number>> = { din: 0.95, psu: 0.95, mcb: 0.95, meanwell: 0.95, coupler: 0.95, flush: 0.66, touch: 0.66, pad: 0.56, pir: 0.3 };

/** Where a device's bus cable meets it. */
export function busAnchor(d: KnxDevice, side?: "main" | "sub"): [number, number] {
  const h = (HEIGHT[d.kind] ?? 0.6) / 2;
  const [x, y] = d.pos;
  const line = side ?? d.line;
  if (line === "main") return [x, y - h];
  return y > BUS.subY ? [x, y - h] : [x, y + h];
}

const trunk = (line: "main" | "sub") => (line === "main" ? BUS.mainY : BUS.subY);

/** 2D route of a telegram along the bus (through the coupler when lines differ). */
export function telegramPath(fromId: string, toId: string): [number, number][] {
  const a = knxById[fromId], b = knxById[toId];
  if (!a.line || !b.line) return [a.pos, b.pos];
  const pts: [number, number][] = [busAnchor(a), [a.pos[0], trunk(a.line)]];
  if (a.line !== b.line) {
    const lc = knxById[BUS.coupler];
    pts.push([lc.pos[0], trunk(a.line)], busAnchor(lc, a.line), busAnchor(lc, b.line), [lc.pos[0], trunk(b.line)]);
  }
  pts.push([b.pos[0], trunk(b.line)], busAnchor(b));
  return pts;
}

export const PACKET_SPEED = 3.2; // board units / second
export function pathLength(pts: [number, number][]) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
}
export const travelMs = (fromId: string, toId: string) => Math.max(600, (pathLength(telegramPath(fromId, toId)) / PACKET_SPEED) * 1000);
