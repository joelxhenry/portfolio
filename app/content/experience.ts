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
      `Collaborated with cross-functional stakeholders to gather requirements, translate business goals into technical solutions, provide accurate time and resource estimates, and deliver impactful features.`,
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
  {
    label: "The Trade Board",
    company: "The Trade Board Limited",
    period: "Mar 2023 – Mar 2024",
    position: "Web Developer",
    pointers: [
      `Designed and developed a web application from concept to deployment, streamlining internal trade and logistics workflows for the Government of Jamaica's Trade Board.`,
      `Created UI prototypes in Figma and implemented them in code to deliver an intuitive user experience for exporters and MSMEs.`,
      `Built the platform on Laravel following the MVC architectural pattern, translating Jamaica Trade Board business requirements into working software.`,
    ],
    skills: ["Laravel", "Figma", "Vue", "TailwindCSS"],
  },
];

export default experiences;
