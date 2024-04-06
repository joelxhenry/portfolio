export interface StackInterface {
  name: string;
}

export interface ProjectInterface {
  title: string;
  description: string;
  image: string;
  preview_link: string;
  source_code_link: string;
  stack: string[];
}

const projects: ProjectInterface[] = [
  {
    title: "Written Character Recognition",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Glamorous Bundles",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Autozone Dealership Management System (ADMS)",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Dominoes",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Zeen",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Tic-Tac-Toe",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque provident autem, ullam expedita incidunt quidem in minima maiores quos consectetur laudantium vel! Molestiae fuga, voluptatem alias ducimus optio eius amet.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
];

export default projects;
