/**
 * CB3S FreeRTOS Air Monitor — custom firmware (PlatformIO + LibreTiny, BK7231N).
 * Source: Test_FreeRTOS project (README, src/main.cpp, include/app.h, include/config.h).
 */

export type RtosTask = {
  id: string;
  name: string;
  file: string;
  prio: number | null;
  stack: number; // words
  peak?: number; // measured high-water mark (words)
  job: string;
};

export const rtosTasks: RtosTask[] = [
  { id: "button", name: "button", file: "task_button.cpp", prio: 4, stack: 384, job: "Polls the button every 10 ms with 30 ms debounce; click = restart, hold 5 s = factory reset" },
  { id: "app", name: "app", file: "task_app.cpp", prio: 3, stack: 512, peak: 240, job: "Runs restart / factory reset from the system queue; status report every 10 s" },
  { id: "sensor", name: "sensor", file: "task_sensor.cpp", prio: 2, stack: 512, peak: 220, job: "Auto-detects the protocol, plays the Wi-Fi side of TuyaMCU, parses DPs into SensorData" },
  { id: "wifi", name: "wifi", file: "task_wifi.cpp", prio: 2, stack: 768, peak: 215, job: "Connect / reconnect (2 s → 60 s back-off), fallback hotspot, scans, unique MAC" },
  { id: "web", name: "web", file: "task_web.cpp", prio: 2, stack: 1088, peak: 690, job: "HTTP server with Digest login, captive-portal DNS, OTA, certificate upload" },
  { id: "led", name: "led", file: "task_led.cpp", prio: 1, stack: 256, job: "LED patterns, driven by task notifications" },
  { id: "mqtt", name: "main (MQTT)", file: "task_mqtt.cpp", prio: null, stack: 2048, job: "MQTT over mutual TLS in the Arduino main task (reuses its idle 8 KB stack); publishes every 5 s" },
];

export const rtosIpc = [
  { id: "events", name: "g_events", type: "Event group", use: "WIFI_CONNECTED · SENSOR_OK · AP_ACTIVE · NET_READY" },
  { id: "sysq", name: "g_sysQueue", type: "Queue (4)", use: "EVT_RESTART / EVT_FACTORY_RESET → app task" },
  { id: "mailbox", name: "g_sensorMailbox", type: "Mailbox (len 1)", use: "xQueueOverwrite() — always the latest SensorData" },
  { id: "notify", name: "Task notifications", type: "Direct to task", use: "LED pattern changes · Wi-Fi scan / new credentials" },
];

/** Scenarios for the interactive task diagram: ordered message hops. */
export type Hop = { from: string; to: string; label: string; log: string };
export const rtosScenarios: { id: string; label: string; hops: Hop[] }[] = [
  {
    id: "sensor",
    label: "Sensor frame → MQTT",
    hops: [
      { from: "mcu", to: "sensor", label: "55 AA 07 (DP report)", log: "[SENSOR] DP18=241 DP19=319 DP22=368 → 24.1 °C, 31.9 %, 368 ppm" },
      { from: "sensor", to: "mailbox", label: "xQueueOverwrite()", log: "[SENSOR] SensorData → g_sensorMailbox" },
      { from: "mailbox", to: "mqtt", label: "xQueuePeek()", log: "[MQTT] publish cb3s/<host>/state {temp,hum,co2,tvoc,ch2o}" },
      { from: "mailbox", to: "web", label: "peek for /api/status", log: "[WEB] GET /api/status → sensor.valid = true" },
    ],
  },
  {
    id: "click",
    label: "Button click → restart",
    hops: [
      { from: "btn", to: "button", label: "P26 LOW · debounced", log: "[BTN] click (< 1 s)" },
      { from: "button", to: "led", label: "notify LED_PULSE", log: "[LED] short flash" },
      { from: "button", to: "sysq", label: "EVT_RESTART", log: "[BTN] → g_sysQueue EVT_RESTART" },
      { from: "sysq", to: "app", label: "xQueueReceive()", log: "[APP] restarting…" },
    ],
  },
  {
    id: "reset",
    label: "Hold 5 s → factory reset",
    hops: [
      { from: "btn", to: "button", label: "held ≥ 1 s", log: "[BTN] hold detected" },
      { from: "button", to: "led", label: "notify LED_BLINK_FAST", log: "[LED] fast blink — keep holding" },
      { from: "button", to: "sysq", label: "EVT_FACTORY_RESET @ 5 s", log: "[BTN] → g_sysQueue EVT_FACTORY_RESET" },
      { from: "sysq", to: "app", label: "erase FlashDB keys", log: "[APP] erase Wi-Fi, MQTT, certs, pins (MAC kept) → reboot" },
    ],
  },
  {
    id: "wifi",
    label: "Wi-Fi lost → hotspot",
    hops: [
      { from: "wifi", to: "events", label: "clear WIFI_CONNECTED", log: "[WIFI] disconnected · retry with back-off" },
      { from: "events", to: "led", label: "ledShowNetState()", log: "[LED] blinking (not connected)" },
      { from: "wifi", to: "events", label: "set AP_ACTIVE", log: "[WIFI] 2 fails → hotspot CB3S-Setup-XXXX · retry every 60 s" },
      { from: "events", to: "sensor", label: "Wi-Fi state → MCU", log: "[SENSOR] → MCU cmd 0x03 state 0x01 (hotspot)" },
      { from: "events", to: "web", label: "captive portal", log: "[WEB] DNS captive portal on 192.168.4.1" },
    ],
  },
];

export const rtosHeap = [
  { label: "Before handshake", kb: 34 },
  { label: "Handshake peak", kb: 8 },
  { label: "Connected", kb: 22 },
];

export const rtosHardware = [
  { id: "cb3s", name: "CB3S Wi-Fi module", detail: "Beken BK7231N · ARM 120 MHz · 256 KB RAM · 2 MB flash · 2.4 GHz", pins: "P10/P11 UART1 → TuyaMCU + flashing · P0 TX2 debug log 115200 · CEN reset" },
  { id: "mcu", name: "TuyaMCU sensor controller", detail: "Owns all sensors, talks to the CB3S over UART at 9600 baud (55 AA frames)", pins: "DP18 temp ÷10 · DP19 humidity ÷10 · DP22 CO₂ ppm · DP21 VOC ppb · DP2 CH₂O" },
  { id: "sensors", name: "Sensors", detail: "Temperature, humidity, CO₂, VOC and formaldehyde (CH₂O)", pins: "Zeros during warm-up are skipped" },
  { id: "led", name: "Status LED", detail: "Solid = Wi-Fi connected · blinking = connecting / hotspot · fast = reset or OTA", pins: "P6 (GPIO6), active HIGH" },
  { id: "button", name: "Button", detail: "Click = restart · hold 5 s = factory reset (cancel between 1–5 s)", pins: "P26 (GPIO26), active LOW" },
  { id: "case", name: "5-in-1 air-quality box", detail: "Tuya enclosure — original cloud firmware replaced, runs fully local", pins: "Web dashboard + MQTT, no cloud, no app" },
];

export const rtosTls = [
  "TLS 1.2 only · client certificate (mutual TLS) · RSA keys",
  "ECDHE-RSA-AES128-GCM-SHA256 first (forward secrecy) · no SHA-1 suites",
  "Broker cert must chain to the uploaded CA, match the server name and carry serverAuth",
  "Publish-only — the device never subscribes, so nothing can command it",
  "Last will: <prefix>/status = offline (retained)",
  "mbedTLS 2.6 extended: 4096-bit RSA, ECDHE + AES-GCM, EMS, encrypt-then-MAC",
];
