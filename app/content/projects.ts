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
    title: "Written Character Recognition",
    description: `
    The project revolves around creating a straightforward tool for recognizing handwritten characters. 
    Implemented with Python and Next.js, it employs a Convolutional Neural Network (CNN) to identify uppercase alphabetical characters. 
    Through meticulous training using labeled data, the CNN model achieves reliable recognition accuracy.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "https://hand-written-character-recognition.onrender.com",
    source_code_link:
      "https://github.com/joelxhenry/Hand-Written-Character-Recognition.git",
    stack: ["Nextjs", "Python", "Typescript", "TensorFlow", "Kaggle Dataset"],
  },
  {
    title: "Autozone Dealership Management System (ADMS)",
    description: `
    The Autozone DMS is a comprehensive car dealership management system designed to streamline business operations. 
    It empowers business owners to efficiently organize their inventory and simplifies essential tasks such as 
    advertising, generating invoices, and managing accounting processes.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Dominoes",
    description: `
     This project was an exciting challenge of digitizing a cherished Caribbean pastime: dominoes. 
     This digital adaptation of the game introduces real-time functionality, 
     allowing two players to engage in lively matches against each other.`,
    image:
      "https://st2.depositphotos.com/19581100/47229/i/450/depositphotos_472296994-stock-photo-playing-dominoes-orange-table-domino.jpg",
    preview_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Zeen",
    description: `
    Zeen presents a straightforward social platform crafted for small business owners eager to showcase their 
    offerings. It provides a convenient reservation system, enabling customers to schedule appointments based on 
    the availability of account holders. Ideal for service professionals such as barbers and hairdressers, Zeen 
    streamlines the booking process and enhances visibility for businesses.`,
    image:
      "https://www.securescan.com/wp-content/uploads/2022/01/OCR-355x510.gif",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
  {
    title: "Tic-Tac-Toe",
    description: `
    The Tic Tac Toe project is a classic implementation of the well-known game, employing the basic features of HTML, 
    CSS, and JavaScript. This simple yet engaging project serves as an excellent starting point for developers 
    to grasp fundamental web development concepts.`,
    image:
      "https://img.freepik.com/premium-vector/tictactoe-game-icon-vector-design-concept-illustration_855620-328.jpg",
    preview_link: "#",
    source_code_link: "#",
    stack: ["Nextjs", "Python", "Typescript"],
  },
];

export default projects;
