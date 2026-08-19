import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/seo/structuredData";

/**
 * robots.txt (generated). Explicitly welcomes the major AI/LLM crawlers in
 * addition to conventional search engines — this portfolio *wants* to be
 * read, cited, and summarized by AI assistants. Points them at both the
 * sitemap and the plain-text corpus at /llms.txt.
 */
export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "cohere-ai",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
