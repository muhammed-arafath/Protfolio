import type { MetadataRoute } from "next";
import { profile, projects } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: profile.siteUrl, lastModified: now, priority: 1 },
    ...projects.map((p) => ({ url: `${profile.siteUrl}/projects/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
