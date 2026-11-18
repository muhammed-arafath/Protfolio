import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — Building Automation & IoT Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#141110 0%,#1C1714 60%,#0b1f45 100%)", color: "#F7F4EE", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#E8401C", textTransform: "uppercase" }}>{profile.title}</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 18, lineHeight: 1 }}>{profile.name}</div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#B0A599" }}>Connecting Technology. Intelligently.</div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 22, color: "#C82909" }}>IoT · Firmware · MQTT · Home Assistant · Node-RED · Grafana · {profile.location}</div>
      </div>
    ),
    size
  );
}
