/** Devices shown in the interactive IoT Lab — modelled on the stack used day-to-day at Inseejam. */

export type LabKind =
  | "climate" | "pir" | "light" | "air" | "meter" | "ir"
  | "board" | "module" | "relay"
  | "router" | "rack" | "hub" | "flow" | "cloud" | "db" | "screen";

export type LabDevice = {
  id: string;
  name: string;
  stage: number;
  kind: LabKind;
  fn: string;
  protocol: string;
  application: string;
  connection: string;
};

export const labStages = ["Sensors", "Microcontroller", "Gateway", "MQTT Broker", "Automation", "Storage", "Dashboard"];

export const labDevices: LabDevice[] = [
  // 0 · Sensors & actuators
  { id: "temp", name: "Temp / Humidity Sensor", stage: 0, kind: "climate", fn: "Measures ambient temperature and relative humidity.", protocol: "I²C / 1-Wire → MCU", application: "HVAC comfort control and room condition logging.", connection: "Read by an ESP32 running ESPHome, published as MQTT telemetry." },
  { id: "pir", name: "PIR Motion Sensor", stage: 0, kind: "pir", fn: "Detects occupancy from infrared movement.", protocol: "Digital GPIO → MCU", application: "Occupancy-based lighting and AC scheduling.", connection: "GPIO interrupt on the MCU → binary_sensor state over MQTT." },
  { id: "lux", name: "Light Sensor", stage: 0, kind: "light", fn: "Measures ambient light level (lux).", protocol: "I²C / ADC → MCU", application: "Daylight-aware lighting automation.", connection: "Sampled by the MCU, pushed as numeric MQTT telemetry." },
  { id: "aq", name: "Air Quality Sensor", stage: 0, kind: "air", fn: "Tracks indoor air quality (CO₂ / VOC / PM).", protocol: "UART / I²C → MCU", application: "Used with IR AC control across the 20 SPL branches.", connection: "MCU publishes readings to MQTT for the automation platform." },
  { id: "meter", name: "Energy Meter", stage: 0, kind: "meter", fn: "Measures voltage, current, power and consumption.", protocol: "Modbus / pulse → MCU or Wi-Fi", application: "Real-time energy monitoring — SPL Batha branch.", connection: "Readings flow to ThingsBoard and Grafana dashboards." },
  { id: "ir", name: "IR AC Controller", stage: 0, kind: "ir", fn: "Sends infrared commands to split AC units.", protocol: "IR (38 kHz) ← MCU", application: "Centralised AC control without touching the AC wiring.", connection: "Subscribes to MQTT commands; the MCU drives the IR LED." },

  // 1 · Microcontrollers
  { id: "esp32", name: "ESP32", stage: 1, kind: "board", fn: "Dual-core Wi-Fi/BLE microcontroller reading sensors and driving outputs.", protocol: "Wi-Fi · MQTT · ESPHome API", application: "Custom sensor nodes, firmware in C++ / ESPHome with OTA updates.", connection: "Connects to the Wi-Fi gateway and publishes to the MQTT broker." },
  { id: "esp8266", name: "ESP8266", stage: 1, kind: "board", fn: "Low-cost Wi-Fi microcontroller for simple nodes.", protocol: "Wi-Fi · MQTT", application: "Lightweight switches and single-sensor nodes.", connection: "Publishes telemetry / subscribes to commands via MQTT." },
  { id: "cb3s", name: "CB3S Module (BK7231N)", stage: 1, kind: "module", fn: "Tuya Wi-Fi module found inside commercial smart devices.", protocol: "Wi-Fi · MQTT (OpenBeken)", application: "Re-flashed with OpenBeken / ESPHome for local, cloud-free control.", connection: "After flashing (Cloud Cutter), talks MQTT directly to the local broker." },
  { id: "relay", name: "Smart Relay", stage: 1, kind: "relay", fn: "Switches lighting or loads on command.", protocol: "GPIO ← MCU · MQTT", application: "Lighting circuits and equipment switching.", connection: "Command topic from Node-RED / Home Assistant toggles the relay." },

  // 2 · Gateway
  { id: "router", name: "Wi-Fi Gateway / Router", stage: 2, kind: "router", fn: "Provides the local network for all field devices.", protocol: "802.11 Wi-Fi · Ethernet · VLAN", application: "Segmented IoT network with Cisco switching and access points.", connection: "Routes device traffic to the broker host on the LAN." },

  // 3 · Broker
  { id: "mqtt", name: "MQTT Broker", stage: 3, kind: "rack", fn: "Publish / subscribe message hub for every device.", protocol: "MQTT 3.1.1 / 5 · TCP 1883 / TLS 8883", application: "Self-hosted in Docker behind Nginx Proxy Manager.", connection: "Fans telemetry out to Node-RED, Home Assistant and ThingsBoard." },

  // 4 · Automation
  { id: "nodered", name: "Node-RED", stage: 4, kind: "flow", fn: "Flow-based logic: parse, transform, route and automate.", protocol: "MQTT · HTTP · InfluxDB nodes", application: "Data push to InfluxDB and rule-based automations.", connection: "Subscribes to MQTT, writes points to InfluxDB." },
  { id: "ha", name: "Home Assistant", stage: 4, kind: "hub", fn: "Central smart-building platform: devices, automations, dashboards.", protocol: "MQTT · ESPHome API · REST", application: "Building automations, YAML config, HACS integrations.", connection: "Collects device states and pushes history to InfluxDB." },
  { id: "tb", name: "ThingsBoard", stage: 4, kind: "cloud", fn: "IoT platform for device management and rule engines.", protocol: "MQTT · HTTP", application: "Fleet management, alerts and client-facing dashboards.", connection: "Ingests telemetry from MQTT; rule chains raise alarms." },

  // 5 · Storage
  { id: "influx", name: "InfluxDB", stage: 5, kind: "db", fn: "Time-series database for sensor history.", protocol: "Line protocol · Flux · HTTP", application: "Retention policies for long-term telemetry.", connection: "Fed by Node-RED and Home Assistant; queried by Grafana." },

  // 6 · Dashboard
  { id: "grafana", name: "Grafana", stage: 6, kind: "screen", fn: "Real-time dashboards and alerting.", protocol: "InfluxDB data source · HTTP", application: "Energy, climate and device-health monitoring panels.", connection: "Queries InfluxDB and visualises trends live." },
];

export const labLinks: [string, string][] = [
  ["temp", "esp32"], ["pir", "esp32"], ["lux", "esp8266"], ["aq", "esp32"], ["meter", "esp8266"], ["esp32", "ir"],
  ["esp32", "router"], ["esp8266", "router"], ["cb3s", "router"], ["router", "relay"],
  ["router", "mqtt"],
  ["mqtt", "nodered"], ["mqtt", "ha"], ["mqtt", "tb"],
  ["nodered", "influx"], ["ha", "influx"],
  ["influx", "grafana"],
];
