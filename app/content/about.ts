export interface AboutContent {
  paragraphs: string[];
  resumeFileName: string;
}

const aboutContent: AboutContent = {
  paragraphs: [
    `I’m a software developer based in Kingston, Jamaica 🇯🇲 with a strong background in full-stack development. Over the past few years, I’ve built scalable systems, collaborated with cross-functional teams, and solved real-world problems through clean, efficient code.`,
    
    `My experience spans Laravel, Vue, React, Yii, and AWS — powering everything from authentication services to inventory management platforms and POS systems. Alongside development, I’ve been expanding into DevOps practices, exploring containerization and infrastructure automation to improve how applications are deployed and scaled.`,
    
    `Beyond coding, I’m passionate about sharing knowledge — whether through technical writing, open-source contributions, or mentoring. My focus is always on building secure, reliable systems while staying adaptable and curious.`,
    
    `On my blog, I share project work and tutorials that highlight both software development and DevOps practices — practical insights drawn from hands-on problem solving.`,
    
    `Let’s connect if you’re into web development, DevOps, cloud tech, or just thoughtful conversations about building things that work.`
  ],
  resumeFileName: "Joel_Henry_Resume.pdf"
};

export default aboutContent;