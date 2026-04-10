export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Contact {
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface AboutContent {
  /**
   * Short, punchy introduction used by the redesigned About section. Keep
   * this to 1–2 sentences — the section's job now is to get visitors to the
   * AI advocate, not to re-state the whole resume.
   */
  intro: string[];
  /**
   * Longer professional summary pulled from the resume. Fed into the bot's
   * knowledge base via {@link app/lib/bot/knowledge.ts}. Visitors never see
   * this directly — it only shapes what the AI advocate can say.
   */
  summary: string;
  /**
   * Full third-person narrative paragraphs. Used by the knowledge base for
   * richer grounding (e.g. "beyond building software…"). Not rendered in the
   * About section anymore.
   */
  paragraphs: string[];
  education: Education;
  contact: Contact;
  resumeFileName: string;
}

const aboutContent: AboutContent = {
  intro: [
    `I'm Joel — a staff software engineer based in Kingston, Jamaica, who ships full-stack systems end to end. I lead teams, design the architecture, and put the code in production.`,
    `The fastest way to get to know me is to ask my AI advocate below. It's read the whole resume and it'll tell you exactly why I'd be a strong fit for whatever you're building.`,
  ],

  summary: `Software engineering leader with experience designing, architecting, and delivering scalable web and mobile applications from concept to production. Proven track record of launching multiple production systems, leading technical implementations across cross-functional teams, and driving architectural decisions across Laravel, .NET, Node.js, Python, and modern JavaScript frameworks. Skilled in translating business requirements into technical proposals, providing time and resource estimates, and establishing CI/CD pipelines and DevOps workflows on AWS infrastructure. Combines deep full-stack expertise with a track record of mentoring engineers and defining architectural standards focused on performance, security, and operational efficiency.`,

  paragraphs: [
    `Joel is a software engineering leader based in Kingston, Jamaica, with experience designing, architecting, and delivering scalable web and mobile applications from concept to production. He has launched multiple production systems, led technical implementations across cross-functional teams, and driven architectural decisions across Laravel, .NET, Node.js, Python, and modern JavaScript frameworks.`,

    `He translates business requirements into technical solutions, provides time and resource estimates, mentors developers, and establishes CI/CD pipelines and DevOps workflows on AWS infrastructure. His work spans REST API design, database architecture, frontend integrations, and cross-platform mobile development with React Native and Flutter.`,

    `Beyond shipping software, Joel invests in sharing knowledge through technical writing, open-source contributions, and mentoring — combining deep full-stack expertise with strong communication and a systems-level perspective on performance, security, and efficiency.`,
  ],

  education: {
    degree: "BSc. Computer Science",
    school: "The University of the West Indies, Mona",
    year: "2022",
  },

  contact: {
    email: "joel.henry.320@gmail.com",
    phone: "(876) 586-3224",
    location: "Kingston, Jamaica",
    website: "joelxhenry.com",
  },

  resumeFileName: "Joel_Henry_Resume.pdf",
};

export default aboutContent;
