/**
 * ─────────────────────────────────────────────────────────────
 *  ALL PORTFOLIO CONTENT LIVES HERE.
 *  Edit this file to update the website — no component changes needed.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: "Muhammed Arafath",
  firstName: "Muhammed",
  lastName: "Arafath",
  initials: "MA",
  logo: "ARAFATH",
  title: "Building Automation Engineer",
  roles: ["Building Automation Engineer", "IoT & Firmware Developer", "IT & Network Specialist"],
  tagline: "Automation · Firmware · IT · Networks",
  company: "Inseejam",
  companySince: "2021",
  location: "Riyadh, Saudi Arabia",
  email: "arafathcmk@gmail.com",
  phone: "+966 502 970 535",
  phoneHref: "tel:+966502970535",
  linkedin: "https://linkedin.com/in/arafathcmk",
  github: "https://github.com/muhammed-arafath",
  availability: "Immediate joining",
  visa: "Transferable Iqama",
  /** Put your photo at /public/profile.jpg — initials are shown until it exists. */
  photo: "/profile.jpg",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://profile-ten-dun.vercel.app",

  heroHeadline: ["Connecting Technology.", "Intelligently."],
  heroSub: "Building Automation | IoT & Firmware | Smart Systems | IT Infrastructure",
  heroBio:
    "8+ years spanning IT infrastructure, networking and building automation. At Inseejam since 2021 — designing smart building systems with KNX/ETS6, IoT platforms, FreeRTOS and CB3S/ESP firmware in C++, data pipelines and automation logic.",

  about: [
    "I'm a versatile technology engineer with 8+ years across IT infrastructure and building automation. Since 2021 at Inseejam, I design and deploy smart building automation systems — working daily with KNX (GVS K-BUS, ETS6), Home Assistant, Node-RED, InfluxDB, Grafana and IoT hardware including ESP32 and CB3S modules, with custom FreeRTOS firmware in C++, Java and Python.",
    "My background in Microsoft platforms, Cisco networking and enterprise security brings a systems-thinking approach to everything I build — from smart device firmware all the way up to monitoring dashboards and cloud integrations.",
  ],

  facts: [
    { k: "Date of Birth", v: "24 May 1997" },
    { k: "Nationality", v: "Indian" },
    { k: "Marital Status", v: "Married" },
    { k: "Visa Status", v: "Transferable Iqama" },
    { k: "At Inseejam Since", v: "2021 · 4+ Years" },
    { k: "Domains", v: "Automation · KNX · Firmware · IT" },
  ],

  strengths: [
    {
      t: "Firmware & Embedded Systems",
      d: "Hands-on with CB3S, ESP8266/ESP32 — flashing custom firmware, writing C++ and Java microcontroller code, integrating devices into automation platforms via MQTT.",
    },
    {
      t: "IoT Platforms & Data Pipelines",
      d: "End-to-end pipelines: device → MQTT → Node-RED → InfluxDB → Grafana dashboards. Device management via ThingsBoard and Home Assistant.",
    },
    {
      t: "IT Infrastructure Depth",
      d: "Microsoft, Cisco and enterprise security expertise from years of IT support and network engineering across KSA and India.",
    },
  ],

  languages: ["English", "Arabic", "Malayalam", "Tamil", "Kannada"],

  stats: [
    { value: 8, suffix: "+", label: "Years Experience" },
    { value: 4, suffix: "", label: "Companies" },
    { value: 4, suffix: "+", label: "Years @ Inseejam" },
    { value: 110, suffix: "", label: "Bank Branches Supported" },
  ],
};

/* ───────────────────────── SKILLS ───────────────────────── */

export type SkillGroupId = "iot" | "devops" | "it";

export const skillGroups: { id: SkillGroupId; label: string; short: string }[] = [
  { id: "iot", label: "Building Automation, IoT & Firmware", short: "Automation & IoT" },
  { id: "devops", label: "DevOps & Self-Hosted Services", short: "DevOps" },
  { id: "it", label: "IT Infrastructure & Networking", short: "IT & Network" },
];

export type Skill = {
  group: SkillGroupId;
  category: string;
  name: string;
  icon: string; // lucide icon name, see components/ui/Icon.tsx
  tags: string[];
  level?: number; // self-assessed proficiency (%) — omit to hide the bar
};

export const skills: Skill[] = [
  { group: "iot", category: "Smart Home Platform", name: "Home Assistant", icon: "home", level: 88, tags: ["Automations", "Integrations", "HACS", "YAML Config", "Dashboards", "MQTT"] },
  { group: "iot", category: "Flow Programming", name: "Node-RED", icon: "workflow", level: 85, tags: ["MQTT Flows", "HTTP Nodes", "Logic", "Dashboard", "Automation", "ThingsBoard"] },
  { group: "iot", category: "Firmware / Module", name: "CB3S & ESPHome", icon: "cpu", level: 87, tags: ["CB3S Module", "ESP8266", "ESP32", "ESPHome", "OTA Updates"] },
  { group: "iot", category: "Alternative Firmware", name: "OpenBeken", icon: "plug", level: 83, tags: ["Tuya Devices", "Flashing", "Local Control", "MQTT", "GPIO Mapping"] },
  { group: "iot", category: "Microcontroller Programming", name: "C++ · Java · Arduino", icon: "code", level: 82, tags: ["C++", "Java", "Arduino IDE", "Sensors", "GPIO", "Serial Comm"] },
  { group: "iot", category: "Scripting & Dev Tools", name: "Python & VS Code", icon: "terminal", level: 80, tags: ["Python Scripts", "Automation", "VS Code", "API Integration", "Data Parsing"] },
  { group: "iot", category: "Time Series DB", name: "InfluxDB", icon: "database", level: 80, tags: ["Data Storage", "Flux Queries", "Telegraf", "Retention Policy"] },
  { group: "iot", category: "Monitoring & Dashboards", name: "Grafana", icon: "chart", level: 82, tags: ["Dashboards", "Alerts", "Panels", "InfluxDB Source"] },
  { group: "iot", category: "IoT Platform", name: "ThingsBoard", icon: "radio", level: 78, tags: ["Device Mgmt", "Rule Engine", "Dashboards", "MQTT"] },
  { group: "iot", category: "Building Bus", name: "KNX & ETS6", icon: "network", tags: ["ETS6", "GVS K-BUS", "TP / USB Interface", "Group Addresses", "Line Coupler", "IR Gateway"] },
  { group: "iot", category: "RTOS Firmware", name: "FreeRTOS · LibreTiny", icon: "cpu", tags: ["Tasks & Queues", "Event Groups", "BK7231N", "PlatformIO", "mbedTLS", "OTA"] },
  { group: "iot", category: "Device Work", name: "Installation & Cloud Cutter", icon: "wrench", level: 92, tags: ["Cloud Cutter", "On-site Install", "Commissioning", "Wiring", "Configuration"] },

  { group: "devops", category: "Containerization", name: "Docker", icon: "box", level: 85, tags: ["Containers", "Docker Compose", "Images", "Volumes", "Networking", "Self-Hosted Apps"] },
  { group: "devops", category: "Reverse Proxy", name: "Nginx Proxy Manager", icon: "shuffle", level: 83, tags: ["Reverse Proxy", "SSL / HTTPS", "Domain Routing", "Access Lists", "Let's Encrypt"] },
  { group: "devops", category: "Identity & Access", name: "Authentik", icon: "key", level: 80, tags: ["SSO", "OAuth2", "LDAP", "User Management", "MFA", "Proxy Provider"] },
  { group: "devops", category: "Version Control", name: "GitHub", icon: "git", level: 82, tags: ["Git", "Repositories", "Version Control", "Collaboration", "Actions"] },
  { group: "devops", category: "Frontend Development", name: "React", icon: "layout", level: 75, tags: ["React.js", "Components", "Hooks", "State Management", "JSX", "npm"] },

  { group: "it", category: "Microsoft Platform", name: "Windows & Server", icon: "server", level: 93, tags: ["Active Directory", "DHCP", "DNS", "Exchange", "Office 365", "Hyper-V"] },
  { group: "it", category: "Networking", name: "LAN / WAN / WLAN", icon: "network", level: 90, tags: ["Cisco Routers", "Switches", "VLAN", "Firewall", "Access Points"] },
  { group: "it", category: "Security", name: "Endpoint & Network", icon: "shield", level: 86, tags: ["Antivirus", "Endpoint Security", "Gateway Filter", "CCTV / NVR"] },
  { group: "it", category: "Hardware & Virtualization", name: "Systems & Devices", icon: "monitor", level: 95, tags: ["Servers", "Desktops", "MFP Printers", "VMware", "Hyper-V"] },
];

/* ───────────────────────── PROJECTS ───────────────────────── */

export type ArchLayer = { name: string; nodes: string[] };

export type Project = {
  slug: string;
  num: string;
  title: string;
  badge: string;
  domain: "automation" | "it";
  visual: "knx" | "firmware" | "spl" | "metro" | "network" | "cctv" | "retail" | "bank" | "hospital";
  status?: string;
  showcase?: "knx" | "freertos";
  company: string;
  year?: string;
  location: string;
  scale: string;
  summary: string;
  challenge: string;
  solution: string;
  tech: string[];
  scope: { title: string; text: string }[];
  architecture: ArchLayer[];
};

export const projects: Project[] = [
  {
    slug: "knx-gvs-bms-demo-case",
    num: "01",
    title: "KNX BMS — GVS K-BUS Demo Case",
    badge: "KNX · ETS6 · Inseejam",
    domain: "automation",
    visual: "knx",
    status: "In progress",
    showcase: "knx",
    company: "Inseejam",
    year: "2026",
    location: "ETS6 project “TP”",
    scale: "2 lines · 19 items",
    summary:
      "KNX building-management demo case built from GVS K-BUS devices and programmed in ETS6 through a KNX-USB TP interface — lighting, LED dimming, shutters, presence and door sensors, Tuya-Zigbee integration and IR-based AC control on a main line and a sub line.",
    challenge:
      "Turn a case of GVS KNX devices into a properly structured BMS: a topology that matches the two physical lines, a clean 3-level group-address plan, and control of a split AC that has no KNX interface at all.",
    solution:
      "Two lines, each with its own 640 mA PSU, joined by a BNLC line coupler; a 3-level GA plan (lighting, shutters, sensors, AC, central/scenes) built in ETS6; the BTIRF-02 IR gateway set up with channel 2 as air-condition control (17 °C minimum, status and swing enabled) and 10 group addresses linked. IR codes are learned from the original remote with the BTIL-01 learner in the IR DCA app.",
    tech: ["KNX TP", "ETS6", "GVS K-BUS", "KNX-USB Interface", "Line Coupler BNLC", "IR Gateway BTIRF-02", "BTIL-01 IR Learner", "Tuya-Zigbee Gateway", "Smart Touch V50s"],
    scope: [
      { title: "Wiring & topology", text: "MCB → two BBPS-02/640.1 PSUs (30 V bus + aux 30 V) and a Mean Well 12 V supply. Main line 1.0 (Tuya gateway) and sub line 1.1 (actuators, IR gateway, sensors, panels) joined by the line coupler 1.1.0." },
      { title: "Group addresses", text: "0 Lighting (switch, status, LED dim/brightness) · 1 Shutters (up/down, stop, position, wind) · 2 Sensors (presence, lux, door) · 3 AC control (3/0/1–5 + status 3/0/11–15) · 4 Central/scenes." },
      { title: "AC control via IR", text: "Panel → KNX telegram → BTIRF-02 sends the learned IR code from CH2 → the AC reacts; the gateway reports the last command back as status. Commissioned with a 7-step Group Monitor test plan." },
    ],
    architecture: [
      { name: "Controls", nodes: ["Smart Touch V50s", "WALTZ Touch+ Pad", "PIR · Door contact"] },
      { name: "KNX TP Bus", nodes: ["Sub line 1.1", "Line Coupler", "Main line 1.0"] },
      { name: "Actuators", nodes: ["Switch Actuator", "LED Dimmer", "Shutter Actuator", "IR Gateway"] },
      { name: "Loads", nodes: ["Lamps 230 V", "LED Strips 12 V", "Curtain", "Split AC (IR)"] },
    ],
  },
  {
    slug: "cb3s-freertos-air-monitor",
    num: "02",
    title: "CB3S FreeRTOS Air Monitor — Custom Firmware",
    badge: "Firmware · FreeRTOS · Inseejam",
    domain: "automation",
    visual: "firmware",
    showcase: "freertos",
    company: "Inseejam",
    location: "PlatformIO · LibreTiny",
    scale: "7 tasks · mutual TLS",
    summary:
      "Custom FreeRTOS firmware for a Tuya 5-in-1 air-quality box built on the CB3S (Beken BK7231N) module. It replaces the Tuya cloud firmware with a fully local device: login-protected web dashboard, MQTT over mutual TLS, OTA updates and a fallback setup hotspot.",
    challenge:
      "The box only worked through the Tuya cloud, the original pin configuration was erased by the first flash, and a TLS handshake with a 4096-bit CA has to fit into roughly 30 KB of free heap on a 120 MHz chip.",
    solution:
      "Six FreeRTOS tasks (plus MQTT in the Arduino main task) talking through an event group, a queue, a length-1 mailbox and task notifications; the Wi-Fi side of the TuyaMCU UART protocol; a manually stepped mbedTLS handshake that frees each credential as early as possible — about 8 KB heap left at the peak.",
    tech: ["FreeRTOS", "CB3S / BK7231N", "LibreTiny", "PlatformIO", "C++", "TuyaMCU UART", "MQTT mTLS", "mbedTLS", "FlashDB", "OTA"],
    scope: [
      { title: "Tasks & IPC", text: "button (prio 4), app (3), sensor / wifi / web (2), led (1); stacks sized from measured high-water marks. Event group for system state, queue for restart / factory reset, xQueueOverwrite mailbox for the latest sensor data." },
      { title: "Sensor protocol", text: "Plays the Wi-Fi-module side of TuyaMCU (55 AA frames at 9600 baud): heartbeat, product / working-mode queries, Wi-Fi state, DP reports for temperature, humidity, CO₂, VOC and CH₂O. Also auto-detects M701-style modules." },
      { title: "Security", text: "HTTP Digest login on every route with lockout after 5 failures; MQTT TLS 1.2 with client certificates, ECDHE-RSA-AES-GCM first, publish-only with a retained last will." },
      { title: "Tooling", text: "Firmware updates over Wi-Fi from the VS Code Upload button, gzip-embedded web UI build step, one-command MQTT certificate provisioning, Mosquitto broker compose file and a Node-RED flow." },
    ],
    architecture: [
      { name: "Sensors", nodes: ["TuyaMCU · UART"] },
      { name: "FreeRTOS", nodes: ["sensor task", "Mailbox", "MQTT task"] },
      { name: "Transport", nodes: ["MQTT · mutual TLS"] },
      { name: "Platform", nodes: ["Mosquitto broker", "Node-RED"] },
    ],
  },
  {
    slug: "spl-palm-automation",
    num: "03",
    title: "SPL Automation — PALM Project",
    badge: "Building Automation · Inseejam",
    domain: "automation",
    visual: "spl",
    company: "Inseejam",
    location: "Saudi Public Library · KSA",
    scale: "20 Branches",
    summary:
      "Smart automation rollout across 20 Saudi Public Library (SPL) branches — IR-based AC control with air quality sensing, plus energy monitoring at the Batha branch.",
    challenge:
      "Bring air-conditioning and indoor air quality across 20 library branches under PALM, the central automation platform, and give the Batha branch live visibility of its energy consumption.",
    solution:
      "Installed IR devices for AC control integrated with air quality sensors in every branch, commissioned them and connected them via MQTT to the PALM central automation platform. At Batha, energy meter sensors feed live consumption readings into ThingsBoard and Grafana dashboards.",
    tech: ["IR Control", "Air Quality", "Energy Meter", "MQTT", "Node-RED", "ThingsBoard", "Grafana"],
    scope: [
      { title: "AC Control & Air Quality", text: "IR devices for AC control integrated with air quality sensors across all 20 SPL branches. Devices commissioned and connected via MQTT to the PALM central automation platform." },
      { title: "Batha Branch — Energy Monitoring", text: "Energy meter sensors installed at the Batha SPL branch for real-time energy consumption reading and monitoring via live dashboards on ThingsBoard and Grafana." },
    ],
    architecture: [
      { name: "Field Devices", nodes: ["IR AC Controllers", "Air Quality Sensors", "Energy Meters"] },
      { name: "Transport", nodes: ["MQTT"] },
      { name: "Logic", nodes: ["Node-RED", "PALM Platform"] },
      { name: "Visualisation", nodes: ["ThingsBoard", "Grafana"] },
    ],
  },
  {
    slug: "riyadh-metro-energy-fiber",
    num: "04",
    title: "Riyadh Metro — 3 Station Energy & Fiber Infrastructure",
    badge: "Industrial Automation · 2023 · Inseejam",
    domain: "automation",
    visual: "metro",
    company: "Inseejam",
    year: "2023",
    location: "Riyadh Metro · KSA",
    scale: "3 Metro Stations",
    summary:
      "Major infrastructure project for the Riyadh Metro network — responsible for high-power energy systems and fiber optic infrastructure across 3 metro stations.",
    challenge:
      "Deliver the high-power energy systems and the fiber optic infrastructure that connect station control equipment across three metro stations.",
    solution:
      "Handled the Motor Control Centre, PLC Room and Distribution Control Panel systems, together with exhaust fan systems, Metro Train Detection and Remote I/O modules linked over fiber.",
    tech: ["High Power Energy", "Fiber Optic", "MCC", "PLC", "DCP", "Exhaust Fan", "MTD", "RIO"],
    scope: [
      { title: "Systems Handled", text: "MCC — Motor Control Centre · PLCR — PLC Room · DCP — Distribution Control Panel." },
      { title: "Equipment", text: "Exhaust fan systems · MTD — Metro Train Detection · RIO — Remote I/O modules." },
    ],
    architecture: [
      { name: "Field Equipment", nodes: ["Exhaust Fans", "MTD", "RIO Modules"] },
      { name: "Backbone", nodes: ["Fiber Optic"] },
      { name: "Control", nodes: ["PLC Room (PLCR)"] },
      { name: "Power", nodes: ["MCC", "DCP"] },
    ],
  },
  {
    slug: "skymark-network-systems",
    num: "05",
    title: "SKYMARK Group — Network & Systems",
    badge: "IT Infrastructure",
    domain: "it",
    visual: "network",
    company: "Project lead",
    location: "Malappuram, India",
    scale: "6-member team",
    summary:
      "Led a 6-member team for a full IT infrastructure deployment at SKYMARK Group, Kerala.",
    challenge:
      "Stand up a complete office IT environment — workstations, cabling, network, printing and accounting software — and hand it over fully documented.",
    solution:
      "OS setup for 10 PCs, structured cabling, network configuration, printer and accounting software setup, complete documentation and formal handover.",
    tech: ["Windows 10", "Networking", "Active Directory", "Structured Cabling"],
    scope: [
      { title: "Deployment", text: "OS setup for 10 PCs, structured cabling and network configuration." },
      { title: "Handover", text: "Printer and accounting software setup, complete documentation and formal handover." },
    ],
    architecture: [
      { name: "Endpoints", nodes: ["10 Workstations", "Printers"] },
      { name: "Network", nodes: ["Structured Cabling", "Switching"] },
      { name: "Services", nodes: ["Active Directory", "Accounting Software"] },
    ],
  },
  {
    slug: "office365-cctv-systems",
    num: "06",
    title: "Enterprise Office 365 & CCTV Systems",
    badge: "IT / Surveillance",
    domain: "it",
    visual: "cctv",
    company: "Multiple clients",
    location: "KSA & India",
    scale: "Multiple sites",
    summary:
      "O365 administration and security management for corporate clients in Riyadh, plus CCTV and IP surveillance deployments across client sites in India and KSA.",
    challenge:
      "Keep corporate Office 365 tenants secure and well-administered, and deliver reliable surveillance across multiple client sites.",
    solution:
      "O365 administration and security management; CCTV and IP surveillance deployments with full cabling, configuration, network integration and ongoing maintenance.",
    tech: ["Office 365", "IP Camera", "NVR / DVR", "Networking"],
    scope: [
      { title: "Office 365", text: "Administration and security management for corporate clients in Riyadh." },
      { title: "Surveillance", text: "CCTV and IP camera deployments — cabling, configuration, network integration and maintenance." },
    ],
    architecture: [
      { name: "Cameras", nodes: ["IP Cameras", "Analog CCTV"] },
      { name: "Recording", nodes: ["NVR", "DVR"] },
      { name: "Network", nodes: ["LAN Integration"] },
      { name: "Cloud", nodes: ["Office 365"] },
    ],
  },
  {
    slug: "riyadh-retail-billing",
    num: "07",
    title: "Riyadh 50 Shops — Billing Software Installation & Support",
    badge: "IT Support · B.K.H Business Solution",
    domain: "it",
    visual: "retail",
    company: "B.K.H Business Solution",
    location: "Riyadh, KSA",
    scale: "50 Shops",
    summary:
      "Deployment and support of billing software across 50 retail shops in Riyadh.",
    challenge: "Roll out billing software to 50 retail shops and keep day-to-day operations running smoothly at every branch.",
    solution:
      "Full installation, configuration, hardware setup, staff training and ongoing technical support.",
    tech: ["Billing Software", "Windows", "Networking", "On-site Support", "Hardware"],
    scope: [
      { title: "Rollout", text: "Installation, configuration and hardware setup at every shop." },
      { title: "Support", text: "Staff training and ongoing on-site and remote technical support." },
    ],
    architecture: [
      { name: "Shops", nodes: ["50 Retail Points"] },
      { name: "Endpoint", nodes: ["Windows PCs", "POS Hardware"] },
      { name: "Application", nodes: ["Billing Software"] },
    ],
  },
  {
    slug: "coop-banks-ibank-support",
    num: "08",
    title: "110 Co-op Banks — System Admin & iBank Support",
    badge: "IT Support · Infosystem HCL",
    domain: "it",
    visual: "bank",
    company: "Infosystem HCL",
    location: "India",
    scale: "110 Branches",
    summary:
      "Large-scale IT support engagement covering 110 co-operative bank branches across India — system administration, iBank core banking support and CCTV.",
    challenge: "Keep 110 bank branches' servers, core banking software and surveillance running reliably.",
    solution:
      "Full system administration (AD, DHCP, DNS, Exchange, group policies), iBank installation/configuration/support, and CCTV monitoring and maintenance.",
    tech: ["Active Directory", "iBank Software", "CCTV", "Exchange Server", "Networking"],
    scope: [
      { title: "System Administration", text: "Active Directory, DHCP, DNS, Exchange Server, group policies, user accounts and server maintenance across 110 branches." },
      { title: "iBank Software Support", text: "Installation, configuration and ongoing support for iBank core banking software — troubleshooting, updates and user assistance." },
      { title: "CCTV Monitoring & Maintenance", text: "DVR/NVR configuration, camera health checks, network integration and issue resolution at bank branches." },
    ],
    architecture: [
      { name: "Branches", nodes: ["110 Bank Branches"] },
      { name: "Identity", nodes: ["Active Directory", "DHCP / DNS"] },
      { name: "Services", nodes: ["Exchange Server", "iBank Core Banking"] },
      { name: "Security", nodes: ["CCTV · DVR / NVR"] },
    ],
  },
  {
    slug: "hospital-cctv-maintenance",
    num: "09",
    title: "Hospital CCTV Maintenance",
    badge: "Surveillance · Meritindia Suculabs",
    domain: "it",
    visual: "hospital",
    company: "Meritindia Suculabs",
    location: "India",
    scale: "24/7 facility",
    summary:
      "Ongoing CCTV surveillance maintenance for hospital facilities — health checks, connectivity verification and fault resolution for critical security monitoring.",
    challenge: "Hospital security monitoring has to stay up around the clock.",
    solution:
      "Regular health checks on IP cameras, DVR and NVR systems, network connectivity verification, fault diagnosis and replacement.",
    tech: ["CCTV", "IP Camera", "DVR / NVR", "Maintenance", "Networking"],
    scope: [
      { title: "Preventive", text: "Regular health checks on IP cameras, DVR and NVR systems and network connectivity verification." },
      { title: "Corrective", text: "Fault diagnosis and replacement to keep critical monitoring available 24/7." },
    ],
    architecture: [
      { name: "Cameras", nodes: ["IP Cameras"] },
      { name: "Recording", nodes: ["DVR", "NVR"] },
      { name: "Monitoring", nodes: ["Security Room"] },
    ],
  },
];

/* ───────────────────────── EXPERIENCE ───────────────────────── */

export const experience = [
  {
    company: "Inseejam",
    role: "Building Automation Engineer",
    location: "Saudi Arabia",
    period: "2021 — Present",
    current: true,
    items: [
      "Design and deploy smart building automation systems using Home Assistant, Node-RED and MQTT",
      "Develop firmware for CB3S and ESP32/ESP8266 modules using C++, Java and ESPHome",
      "Flash and configure Tuya-based smart devices with OpenBeken for local MQTT control",
      "Write Python and Arduino programs for sensor integration, GPIO control and data acquisition",
      "Install and commission smart devices and cloud cutter hardware on-site at client locations",
      "Build real-time monitoring dashboards in Grafana connected to InfluxDB time-series pipelines",
      "Manage IoT device fleets, rule engines and alerts via ThingsBoard platform",
      "Maintain, troubleshoot and upgrade all deployed automation and smart device infrastructure",
      "Build a KNX BMS demo case with GVS K-BUS devices in ETS6 over a KNX-USB TP interface — two-line topology with line coupler, 3-level group-address plan, IR gateway AC control",
      "Develop custom FreeRTOS firmware for CB3S (BK7231N) air-quality sensors — multi-task design, TuyaMCU UART protocol, MQTT over mutual TLS, OTA updates",
    ],
    tech: ["KNX", "ETS6", "GVS K-BUS", "FreeRTOS", "LibreTiny", "Home Assistant", "Node-RED", "MQTT", "CB3S Firmware", "ESPHome", "OpenBeken", "C++", "Java", "Python", "Arduino", "InfluxDB", "Grafana", "ThingsBoard", "VS Code"],
  },
  {
    company: "B.K.H Business Solution for Information Technology",
    role: "System Hardware & Software Service Engineer",
    location: "Riyadh, KSA",
    period: "Dec 2019 — 2021",
    current: false,
    items: [
      "Software installation, configuration and issue resolution across client environments",
      "Office 365 administration — user management, licenses and security policies",
      "Administering internet firewall, gateway security and traffic filtering",
      "Resolving hardware issues on workstations, servers and computers",
      "Installation and configuration of network routers, switches and access points",
      "Setup and maintenance of managed multifunction printers",
      "On-site and remote technical support for corporate clients",
    ],
    tech: ["Office 365", "Firewall", "Networking", "Tech Support"],
  },
  {
    company: "Infosystem HCL Pvt. Ltd.",
    role: "Technical Support Engineer",
    location: "India",
    period: "2018 — 2021",
    current: false,
    items: [
      "Hardware and software support for co-operative bank environments",
      "Active Directory DC, DHCP and Exchange Server setup and configuration",
      "Created and deployed AD group policies to users and groups",
      "Structured LAN/WAN network installation and configuration",
      "IP camera and CCTV solution installation and maintenance",
      "Antivirus, internet and endpoint security deployment",
      "IT server and network technical support for clients",
    ],
    tech: ["Active Directory", "Exchange Server", "CCTV", "LAN/WAN"],
  },
  {
    company: "Meritindia Suculabs Pvt. Ltd.",
    role: "System Support Engineer",
    location: "India",
    period: "2017 — 2018",
    current: false,
    items: [
      "Active Directory, DHCP and Exchange Server installation and configuration",
      "User account setup, permissions and password management",
      "Daily monitoring of network usage and performance",
      "Hardware installation — servers, printers, workstations",
      "Multifunction printer installation and troubleshooting",
      "On-site and remote technical support for clients",
      "New software installation and application deployments",
    ],
    tech: ["Active Directory", "Windows Server", "Hardware", "Tech Support"],
  },
];

/* ───────────────────────── ACTIVITY LOG ───────────────────────── */

export const activity = [
  { tool: "ETS6 · KNX", task: "GVS demo case — topology, group addresses & IR gateway AC control", date: "2026-11-11 → ongoing" },
  { tool: "Home Assistant", task: "Data collected & pushed to InfluxDB", date: "2026-04-23" },
  { tool: "Grafana", task: "Dashboard setup & monitoring", date: "2025-12-01 → 2026-04-20" },
  { tool: "Node-RED", task: "Data push to InfluxDB", date: "2025-12-01 → 2026-01-31" },
];

/* ───────────────────────── EDUCATION ───────────────────────── */

export const education = [
  { year: "2019", degree: "Diploma in Computer Hardware & Engineering", school: "Technical Education Kerala" },
  { year: "2014 — 2016", degree: "Higher Secondary — Science Stream", school: "Board of HSE Kerala" },
  { year: "2014", degree: "Secondary School Certificate", school: "GHSS Tirurangadi · Board of Examination Kerala" },
];

export const techStacks = [
  {
    title: "Building Automation & Firmware Stack",
    tone: "cyan" as const,
    rows: [
      "Home Assistant · Node-RED · ThingsBoard · ESPHome · OpenBeken",
      "CB3S Firmware · ESP8266 / ESP32 · Arduino · OTA Updates · MQTT",
      "Microcontroller programming — C++, Java, Python · VS Code · PlatformIO",
      "InfluxDB · Grafana · Cloud Cutter · Device installation & commissioning",
    ],
  },
  {
    title: "IT & Network Stack",
    tone: "neon" as const,
    rows: [
      "Active Directory · DHCP · DNS · Exchange Server · Office 365 · Hyper-V",
      "Cisco Routers · Switches · VLAN · LAN/WAN · Firewall · Access Points",
      "Windows Server · Ubuntu · Linux · VMware · Antivirus · Endpoint Security",
    ],
  },
  {
    title: "DevOps & Self-Hosted Stack",
    tone: "accent" as const,
    rows: [
      "Docker · Docker Compose · Container management · Self-hosted applications",
      "Nginx Proxy Manager · Reverse proxy · SSL/HTTPS · Domain routing · Let's Encrypt",
      "Authentik · SSO · OAuth2 · LDAP · MFA · Identity & access management",
      "GitHub · Git version control · Repositories · Collaboration · GitHub Actions",
    ],
  },
];

/**
 * Certifications — add entries and the section appears automatically.
 * Example:
 * { name: "…", issuer: "…", date: "2025-01", credentialId: "…", image: "/certs/x.jpg", url: "https://…" }
 */
export const certifications: {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  image?: string;
  url?: string;
}[] = [];

/* ───────────────────────── WORKFLOW ───────────────────────── */

export const workflow = [
  { n: "01", t: "Discover", d: "Understand site requirements, existing equipment and what the client needs to see and control." },
  { n: "02", t: "Design", d: "Choose devices, firmware and protocols; sketch the data path from sensor to dashboard." },
  { n: "03", t: "Integrate", d: "Flash firmware, commission devices on-site and connect them over MQTT to the automation platform." },
  { n: "04", t: "Monitor", d: "Stream telemetry into InfluxDB, build Grafana / ThingsBoard dashboards and alerts." },
  { n: "05", t: "Optimize", d: "Maintain, troubleshoot and upgrade deployed systems for reliability and efficiency." },
];

export const nav = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "lab", label: "IoT Lab" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];
