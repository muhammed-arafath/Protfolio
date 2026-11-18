// Usage: node scripts/extract-photo.mjs path/to/old-portfolio.html
// Pulls the first embedded base64 JPEG/PNG out of an HTML file and saves it as public/profile.jpg
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/extract-photo.mjs <file.html>");
  process.exit(1);
}
const html = readFileSync(file, "utf8");
const m = html.match(/data:image\/(jpeg|jpg|png);base64,([A-Za-z0-9+/=]+)/);
if (!m) {
  console.error("No embedded base64 image found in", file);
  process.exit(1);
}
const out = new URL("../public/profile.jpg", import.meta.url);
writeFileSync(out, Buffer.from(m[2], "base64"));
console.log("Saved", out.pathname, `(${m[1]}, ${Math.round((m[2].length * 3) / 4 / 1024)} KB)`);
