export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  ariaLabel: string;
}

export const socials: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/joelxhenry", // Replace with your actual GitHub username
    icon: "FaGithub",
    ariaLabel: "GitHub Profile"
  },
  {
    name: "LinkedIn", 
    url: "https://www.linkedin.com/in/joel-henry-518512258", // Replace with your actual LinkedIn username
    icon: "FaLinkedin",
    ariaLabel: "LinkedIn Profile"
  },
  // {
  //   name: "Twitter",
  //   url: "https://twitter.com/joel_henry", // Replace with your actual Twitter username  
  //   icon: "FaTwitter",
  //   ariaLabel: "Twitter Profile"
  // }
];