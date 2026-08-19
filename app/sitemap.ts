import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo/structuredData";

/**
 * sitemap.xml (generated). Single-page portfolio, so one canonical entry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
