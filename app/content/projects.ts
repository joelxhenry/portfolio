export interface StackInterface {
  name: string;
}

export interface ProjectInterface {
  title: string;
  description: string;
  image: string;
  preview_link?: string;
  source_code_link?: string;
  blog_link?: string;
  stack: string[];
}

const projects: ProjectInterface[] = [
  {
    title: "Kova",
    description: `Built a custom invoicing tool powered by AI to streamline invoice generation, management, and tracking. Designed to solve real-world billing pain points with intelligent automation and a clean, intuitive interface.`,
    image:
      "https://console-logs.hashnode.dev/_next/image?url=https%3A%2F%2Fcdn.hashnode.com%2Fuploads%2Fcovers%2F68629f4b54d9ed2c64408dd6%2F82ca2050-d368-473d-9245-28ac2eb8bb70.jpg&w=3840&q=75",
    blog_link:
      "https://console-logs.hashnode.dev/i-built-my-own-invoicing-tool-using-ai-here-s-why-that-matters",
    stack: ["AI", "TypeScript", "Next.js"],
  },
  {
    title: "The Export Academy",
    description: `
    EXPORTAcademy is a powerful launchpad! It equips our exporters and MSMEs with the tools, knowledge, and confidence to thrive in the global marketplace.`,
    image:
      "https://png.pngtree.com/thumb_back/fh260/background/20200220/pngtree-container-port-terminal-design-for-export-container-trucks-working-image_330191.jpg",
    preview_link: "https://exportacademyja.com/",
    stack: ["Laravel", "Typescript", "Vue3", "TailwindCSS"],
  },
  {
    title: "Island Routes Website",
    description: `
    Developed and maintained a centralized content management system for multiple websites,
    including Island Routes, Blue Mountain, and Mystic Mountain. The system integrates seamlessly with Resmark's tour hosting platform, enabling real-time tour bookings and secure payment processing through dedicated APIs.`,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2V3oY-NEbZP97YmrIWsx0v3Ay6hmaWDNB4g&s",
    preview_link: "https://www.islandroutes.com/",
    stack: ["Laravel", "Typescript", "Vue3", "TailwindCSS"],
  }
];

export default projects;
