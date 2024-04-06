export interface ExperienceInterface {
  label: string;
  company: string;
  period: string;
  position: string;
  pointers: string[];
  skills: string[];
}

const experiences: ExperienceInterface[] = [
  {
    label: "Crixus Developer",
    company: "Crixus Tech",
    period: "Dec 2022 - Present",
    position: "Junior Software Developer (Contract)",
    pointers: [
      `Utilized Yii2 and .NET frameworks following the MVC architectural pattern to develop highly scalable and reliable software 
      solutions, meeting clients' requirements and goals.
      `,
      ` Developed and maintained RESTful APIs, ensuring seamless communication between application components.`,
      `Employed caching and code optimization techniques to improve API response time by an impressive 92%, enhancing overall system performance and delivering a smoother user experience.`,
      `Wrote comprehensive unit, functional, and acceptance tests using the Codeception PHP testing framework, guaranteeing the quality and stability of the developed software, and supporting efficient debugging and maintenance processes.`,
    ],
    skills: [
      "yii",
      ".NET C#",
      "Sql",
      "Codeception",
      "GitLab",
      "Entity Framework",
    ],
  },
  {
    label: "Export Academy",
    company: "Jamaica Trade Board Ltd.",
    period: "Feb 2023 - Present",
    position: "Full-Stack Developer (Intern)",
    pointers: [
      `Contributed to the design and development of a new initiative of the Government of Jamaica and the Jamaica Trade Board to reduce the knowledge in exporting products from the country, by promoting and facilitating increased product exportation for businesses and individuals.`,
      `Exhibited strong communication skills, effectively translating technical concepts to non-technical stakeholders, ensuring clear understanding and alignment of project objectives.`,
      `Utilized full-stack development skills to implement the platform using the PHP Laravel framework, following the MVC architectural pattern, and gaining valuable insights and knowledge throughout the web development process.`,
    ],
    skills: ["Laravel", "Sql"],
  },
  {
    label: "Island Routes",
    company: "Island Routes",
    period: "Nov 2023 - Apr 2024",
    position: "Web Developer",
    pointers: [
      `Contributed to the design and development of a new initiative of the Government of Jamaica and the Jamaica Trade Board to reduce the knowledge in exporting products from the country, by promoting and facilitating increased product exportation for businesses and individuals.`,
      `Exhibited strong communication skills, effectively translating technical concepts to non-technical stakeholders, ensuring clear understanding and alignment of project objectives.`,
      `Utilized full-stack development skills to implement the platform using the PHP Laravel framework, following the MVC architectural pattern, and gaining valuable insights and knowledge throughout the web development process.`,
    ],
    skills: ["Laravel", "React", "BitBucket"],
  },
  {
    label: "TBL Jamaica",
    company: "Jamaica Trade Board Ltd.",
    period: "May 2024 - Present",
    position: "Software Developer (Consultant)",
    pointers: [
      `Contributed to the design and development of a new initiative of the Government of Jamaica and the Jamaica Trade Board to reduce the knowledge in exporting products from the country, by promoting and facilitating increased product exportation for businesses and individuals.`,
      `Exhibited strong communication skills, effectively translating technical concepts to non-technical stakeholders, ensuring clear understanding and alignment of project objectives.`,
      `Utilized full-stack development skills to implement the platform using the PHP Laravel framework, following the MVC architectural pattern, and gaining valuable insights and knowledge throughout the web development process.`,
    ],
    skills: ["Laravel", "Sql"],
  },
];

export default experiences;
