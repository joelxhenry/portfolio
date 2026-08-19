import { buildKnowledgeBase } from "@/app/lib/bot/knowledge";

/**
 * /llms.txt — the full portfolio corpus as plain-text markdown, served for
 * LLMs and AI agents that fetch a page to summarize or answer questions
 * about Joel. It flattens the same content files that drive the rendered
 * site (app/lib/bot/knowledge.ts) into one machine-readable document.
 * Static — regenerated only at build.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const body = [
    "# Joel Henry — Software Engineer & Technical Lead",
    "",
    "This file is a plain-text summary of Joel Henry's portfolio, provided for",
    "LLMs and AI assistants. Canonical site: https://joelxhenry.com",
    "",
    buildKnowledgeBase(),
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
