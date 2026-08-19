import aboutContent from "@/app/content/about";
import experiences from "@/app/content/experience";
import projects from "@/app/content/projects";
import skills from "@/app/content/skills";

/**
 * The canonical public URL for the site. Used as the identity anchor for the
 * JSON-LD graph and for absolute URLs in Open Graph / sitemap metadata.
 */
export const SITE_URL = "https://joelxhenry.com";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Builds a schema.org `Person` document (JSON-LD) describing Joel from the
 * same content files that drive the rendered site. This is what lets search
 * engines and AI crawlers (Google, ChatGPT, Claude,
 * Perplexity, …) understand who Joel is, what he does, and what he has built
 * — as structured data rather than scraped prose. Keep it derived from the
 * content so it never drifts from the page.
 */
export function buildPersonJsonLd() {
  const { summary, education, contact } = aboutContent;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Joel Henry",
    jobTitle: "Software Engineer & Technical Lead",
    description: normalizeWhitespace(summary),
    url: SITE_URL,
    email: `mailto:${contact.email}`,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kingston",
      addressCountry: "JM",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: education.school,
    },
    knowsAbout: skills.map((skill) => skill.name),
    hasOccupation: experiences.map((exp) => ({
      "@type": "Occupation",
      name: exp.position,
      occupationLocation: {
        "@type": "Organization",
        name: exp.company,
      },
      description: normalizeWhitespace(exp.pointers[0] ?? ""),
    })),
    workExample: projects.map((project) => ({
      "@type": "CreativeWork",
      name: project.title,
      abstract: normalizeWhitespace(project.description),
      ...(project.preview_link ? { url: project.preview_link } : {}),
      keywords: project.stack.join(", "),
    })),
  };
}
