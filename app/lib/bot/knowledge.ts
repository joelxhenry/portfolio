import aboutContent from '@/app/content/about';
import experiences from '@/app/content/experience';
import projects from '@/app/content/projects';
import skills from '@/app/content/skills';
import blogs from '@/app/content/blogs';

/**
 * Flattens the portfolio content files into a single markdown document that
 * the voice-box bot uses as grounding context (see .plans/bot.md, Phase 1).
 *
 * The full corpus is under ~10k tokens so we pass the whole thing to Gemini
 * on every turn — no embeddings, no retrieval layer. Keep this function pure
 * and deterministic so callers can memoize the result per process.
 */
export function buildKnowledgeBase(): string {
  return [
    buildAboutSection(),
    buildEducationSection(),
    buildContactSection(),
    buildExperienceSection(),
    buildProjectsSection(),
    buildSkillsSection(),
    buildBlogsSection(),
  ].join('\n\n');
}

function buildAboutSection(): string {
  const lines: string[] = ['## About Joel', ''];
  lines.push('### Professional Summary', '');
  lines.push(normalizeWhitespace(aboutContent.summary), '');
  lines.push('### Narrative', '');
  for (const paragraph of aboutContent.paragraphs) {
    lines.push(normalizeWhitespace(paragraph), '');
  }
  return lines.join('\n').trimEnd();
}

function buildEducationSection(): string {
  const { degree, school, year } = aboutContent.education;
  return `## Education\n\n- ${degree} — ${school} (${year})`;
}

function buildContactSection(): string {
  // Contact details Joel has already put on his public resume. The bot is
  // still instructed via the system prompt (see app/lib/bot/prompt.ts) not
  // to volunteer personal details beyond the public portfolio, but having
  // the canonical location + site makes "where is Joel based?" answerable.
  const { location, website } = aboutContent.contact;
  return [
    '## Contact & Location',
    '',
    `- Location: ${location}`,
    `- Portfolio: ${website}`,
    '- For direct contact, always point visitors at the contact form on this site.',
  ].join('\n');
}

function buildExperienceSection(): string {
  const lines: string[] = ['## Experience', ''];
  for (const exp of experiences) {
    lines.push(`### ${exp.position} — ${exp.company} (${exp.period})`, '');
    for (const pointer of exp.pointers) {
      lines.push(`- ${normalizeWhitespace(pointer)}`);
    }
    if (exp.skills.length > 0) {
      lines.push(`- Stack: ${exp.skills.join(', ')}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function buildProjectsSection(): string {
  const lines: string[] = ['## Projects', ''];
  for (const project of projects) {
    lines.push(`### ${project.title}`, '');
    lines.push(normalizeWhitespace(project.description));
    if (project.stack.length > 0) {
      lines.push(`- Stack: ${project.stack.join(', ')}`);
    }
    if (project.preview_link) {
      lines.push(`- Preview: ${project.preview_link}`);
    }
    if (project.blog_link) {
      lines.push(`- Write-up: ${project.blog_link}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function buildSkillsSection(): string {
  const names = skills.map((s) => s.name).join(', ');
  return `## Skills\n\n${names}`;
}

function buildBlogsSection(): string {
  if (blogs.length === 0) {
    return '## Blog Posts\n\n(No published posts in the knowledge base yet.)';
  }
  const lines: string[] = ['## Blog Posts', ''];
  for (const blog of blogs) {
    lines.push(`### ${blog.title} (${blog.dateAdded})`, '');
    lines.push(normalizeWhitespace(blog.brief), '');
  }
  return lines.join('\n').trimEnd();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
