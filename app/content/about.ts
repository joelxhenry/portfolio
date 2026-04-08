export interface AboutContent {
  paragraphs: string[];
  resumeFileName: string;
}

const aboutContent: AboutContent = {
  paragraphs: [
    `I'm a software engineering leader based in Kingston, Jamaica, with experience designing, architecting, and delivering scalable web and mobile applications from concept to production. I've launched multiple production systems, led technical implementations across cross-functional teams, and driven architectural decisions across Laravel, .NET, Node.js, Python, and modern JavaScript frameworks.`,

    `I'm skilled in translating business requirements into technical solutions, providing time and resource estimates, mentoring developers, and establishing CI/CD pipelines and DevOps workflows on AWS infrastructure. My work spans everything from REST API design and database architecture to frontend integrations and cross-platform mobile development with React Native and Flutter.`,

    `Beyond building software, I'm passionate about sharing knowledge through technical writing, open-source contributions, and mentoring. I combine deep full-stack expertise with strong communication and a systems-level perspective on performance, security, and efficiency.`,

    `Let's connect if you're into web development, DevOps, cloud infrastructure, or building things that scale.`
  ],
  resumeFileName: "Joel_Henry_Resume.pdf"
};

export default aboutContent;
