export interface ExperienceInterface {
  label: string;
  company: string;
  period: string;
  position: string;
  pointers: string[];
  skills: string[];
}

// Source of truth for both the (currently-unused) Experience section
// component and the bot's knowledge base. Bullets are lifted from Joel's
// resume verbatim — if the resume changes, this file changes.
const experiences: ExperienceInterface[] = [
  {
    label: "The Trade Board (GOJ)",
    company: "The Trade Board Limited — Government of Jamaica",
    period: "Mar 2023 – Mar 2024",
    position: "Web Developer",
    pointers: [
      `Designed, developed, and deployed a web application from concept to production for the Government of Jamaica's Trade Board, streamlining internal trade and logistics workflows for exporters and MSMEs.`,
      `Participated in the review of business and system requirements, conferring with Trade Board end users and divisional representatives to clarify system intent, output requirements, and internal checks — then translated those needs into accurate technical solutions.`,
      `Created UI prototypes in Figma and implemented them in code, delivering an intuitive, high-performance user experience aligned to GOJ stakeholder feedback.`,
      `Built the platform on Laravel following the MVC architectural pattern and established coding standards, producing a maintainable code base with supporting technical documentation.`,
      `Performed unit testing and evaluation to ensure requirements were met and errors handled properly, and supported ongoing maintenance, modifications, and enhancements after release.`,
    ],
    skills: ["Laravel", "Figma", "Vue", "TailwindCSS", "Requirements Analysis"],
  },
  {
    label: "Island Routes",
    company: "Island Routes",
    period: "Nov 2023 – Present",
    position: "Software Developer (Technical Lead)",
    pointers: [
      `Defined the technical roadmap for the company's core platform, standardizing architecture across three new web applications and driving the retirement of legacy systems to reduce operational overhead.`,
      `Launched three production applications from inception to release within two years, establishing the company-wide standard for new service rollout while maintaining and upgrading 4+ existing systems for stability and security.`,
      `Led cross-team migration of legacy projects into containerized Docker environments, standardizing development workflows and reducing onboarding time for new developers across engineering.`,
      `Owned deployment strategy across development, sandbox, and production environments for Laravel and .NET applications on AWS (EC2, S3, CloudFront, Load Balancers, Route 53) and on-premise servers.`,
      `Designed and implemented CI/CD pipelines using Git branching strategies, automated migrations, and deployment scripts, improving release reliability and reducing downtime across all projects.`,
      `Integrated third-party systems including the Resmark API, automating bookings, payments, and transactional workflows for the company's digital platforms.`,
      `Built cross-platform mobile applications using React Native and Flutter, ensuring consistent UX and performance across iOS and Android.`,
      `Developed automated test suites (PHPUnit, Pest) and established QA standards adopted across the team, ensuring production readiness before each release.`,
      `Managed the technical aspects of website development across multiple public-facing sites, building and maintaining a centralized content management system that let non-technical content teams publish and manage media independently.`,
      `Owned technical SEO across the public-facing sites — structured data (JSON-LD), semantic markup, sitemaps, canonical tags, and Core Web Vitals — driving higher organic search rankings and click-through for the company's tours and destinations.`,
      `Optimized the sites for the new generation of AI-powered search and LLM agents (Generative Engine Optimization), authoring machine-readable content, llms.txt, and structured metadata so answer engines like ChatGPT, Perplexity, and Google AI Overviews could accurately discover, cite, and surface Island Routes offerings.`,
      `Collaborated with cross-functional stakeholders to gather requirements, translate business goals into technical solutions, provide accurate time and resource estimates, produce technical documentation, and deliver impactful features.`,
    ],
    skills: [
      "Laravel",
      ".NET",
      "React Native",
      "Flutter",
      "Docker",
      "AWS",
      "CI/CD",
      "Pest",
      "PHPUnit",
      "SEO",
      "GEO / AEO",
      "Structured Data",
    ],
  },
  {
    label: "Crixus Ltd",
    company: "Crixus Ltd",
    period: "Dec 2022 – Present",
    position: "Software Developer (Consultant)",
    pointers: [
      `Optimized API performance, reducing JSON response times by 80% and cutting overall load times by 60% through targeted profiling and code improvements.`,
      `Resolved critical memory leaks in a legacy system, restoring stability and eliminating recurring crashes.`,
      `Implemented asynchronous job processing for onboarding, transactions, and background tasks, reducing queue times by up to 60%.`,
      `Designed and built a webhook system and user notification triggers (e.g., low balance alerts), increasing customer engagement and enabling proactive interactions.`,
      `Strengthened platform security by improving API key management processes, reducing unauthorized access by 10%.`,
      `Improved developer productivity by documenting API error reporting and removing obsolete dependencies, cutting debugging time by 80%.`,
    ],
    skills: [".NET", "Yii", "SQL", "Codeception"],
  },
];

export default experiences;
