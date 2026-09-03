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
  /**
   * Optional demo video. Accepts a YouTube or Loom share URL (rendered as an
   * inline responsive player) or any other URL (rendered as a "Watch demo"
   * link button). See app/sections/projects.tsx.
   */
  video_link?: string;
  stack: string[];
}

const projects: ProjectInterface[] = [
  {
    title: "Kova",
    description: `An AI-powered invoicing tool — and itself built with AI as a coding collaborator. Kova streamlines invoice generation, management, and tracking with intelligent automation and a clean, intuitive interface, solving real billing pain points end to end.`,
    image: "/KOVA.jpg",
    blog_link:
      "https://console-logs.hashnode.dev/i-built-my-own-invoicing-tool-using-ai-here-s-why-that-matters",
    stack: ["AI", "TypeScript", "Next.js"],
  },
  {
    title: "Harmon Commerce",
    description: `Shopify for emerging markets — a white-label commerce platform where any merchant can sign up and, in minutes, get a fully isolated, production-ready store of their own. Under the hood it's a single shared Vendure engine serving every tenant, with automated provisioning, per-tenant data isolation, and a Next.js 16 + Payload CMS storefront. Merchants run their entire business through the Harmon Dashboard and never know the engine exists. Architected and built end to end: multi-tenancy, billing, the API gateway, and the design system.

    Live storefront demo: demo.harmonstore.online — email: demo@zeenconnect.com · password: demoP@ssw0rd`,
    image: "/harmon-logo.png",
    preview_link: "https://harmoncommerce.com/",
    // Paste your YouTube or Loom share URL here once the demo is recorded —
    // it renders as an inline player on the card automatically.
    video_link: "https://www.loom.com/share/6bb17dfc82af4a0cb387782e753b1b29",
    stack: ["Vendure", "TypeScript", "Next.js", "Payload CMS", "GraphQL", "TailwindCSS"],
  },
  {
    title: "Export Academy",
    description: `An e-learning and export-readiness platform that trains and certifies exporters — course content and a resource library, multi-format assessments with per-user progress tracking, and an admin dashboard with reporting. Built on Laravel + Inertia.js, I also led its migration from Vue 3 + PrimeVue to a modern React 19 + shadcn/ui front end, porting the full page and component surface without touching the PHP backend.`,
    image: "/export-academy-logo.png",
    preview_link: "https://ea-app.zncn.app",
    stack: ["Laravel", "Inertia.js", "React", "TypeScript", "TailwindCSS"],
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
