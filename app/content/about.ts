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
   * Short, punchy introduction shown in the About section. Keep this to
   * 1–2 sentences that orient the visitor before the résumé/contact CTAs.
   */
  intro: string[];
  /**
   * Longer professional summary pulled from the resume. Not rendered in the
   * About section; it feeds the machine-readable corpus at /llms.txt (via
   * {@link app/lib/bot/knowledge.ts}) and the JSON-LD Person description.
   */
  summary: string;
  /**
   * Full third-person narrative paragraphs. Not rendered in the About
   * section — used only to enrich the /llms.txt corpus for AI crawlers.
   */
  paragraphs: string[];
  education: Education;
  contact: Contact;
  resumeFileName: string;
}

const aboutContent: AboutContent = {
  intro: [
    `I'm Joel — a software engineer and technical lead based in Kingston, Jamaica, who ships full-stack systems end to end. I've built and maintained web applications for the public and private sector — including a platform for the Government of Jamaica's Trade Board — from requirements analysis through architecture, documentation, testing, and production support.`,
    `Below you'll find the roles I've held, the systems I've shipped, and the tools I reach for. If any of it lines up with what you're building, I'd love to talk.`,
  ],

  summary: `Software engineer and technical lead with experience designing, developing, documenting, and maintaining scalable web applications and digital platforms from concept to production. Delivered software for the Government of Jamaica (Trade Board Limited) as well as private-sector clients, translating business and system requirements into working solutions in close collaboration with end users and cross-functional stakeholders. Proven track record of launching and maintaining multiple production systems, producing technical design documentation, performing unit testing and troubleshooting production issues, and establishing CI/CD pipelines and DevOps workflows on AWS. Skilled across Laravel, .NET, Node.js, Python, and modern JavaScript frameworks (React, Next.js, Vue), with strong business-analysis instincts — gathering requirements, estimating time and resources, and presenting complex technical information clearly to varied audiences. Combines full-stack depth with a focus on performance, security, maintainability, and operational efficiency.`,

  paragraphs: [
    `Joel is a software engineer and technical lead based in Kingston, Jamaica, with experience designing, developing, documenting, and maintaining scalable web and mobile applications from concept to production. He has delivered software for the Government of Jamaica's Trade Board Limited alongside private-sector clients, launching multiple production systems and driving architectural decisions across Laravel, .NET, Node.js, Python, and modern JavaScript frameworks.`,

    `He actively participates in the review of business and system requirements, confers with end users and divisional representatives to clarify system intent and output requirements, and translates those needs into accurate technical solutions with realistic time and resource estimates. He produces technical documentation that depicts the software design and code base, performs unit testing and evaluation before release, and expeditiously troubleshoots production issues without introducing new ones. His work spans website development and content management, REST API design, database design and file management, CI/CD on AWS, and cross-platform mobile development with React Native and Flutter.`,

    `Beyond shipping software, Joel reviews and improves the effectiveness of existing systems, mentors developers, and shares knowledge through technical writing — combining full-stack expertise with strong written and verbal communication and a systems-level perspective on performance, security, maintainability, and efficiency. He keeps current with ICT trends and enjoys partnering with non-technical stakeholders, including communications and content teams, to deliver high-performance, highly available digital platforms.`,
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
