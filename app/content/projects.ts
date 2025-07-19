export interface StackInterface {
  name: string;
}

export interface ProjectInterface {
  title: string;
  description: string;
  image: string;
  preview_link?: string;
  source_code_link?: string;
  stack: string[];
}

const projects: ProjectInterface[] = [
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
    title: "Island Routes CMS",
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
