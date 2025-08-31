export interface BlogInterface {
  title: string;
  brief: string;
  slug: string;
  dateAdded: string;
  coverImage?: string;
  readTime: number;
  tags: string[];
}

const blogs: BlogInterface[] = [
  {
    title: "It's Time I Started Sharing More of My Work",
    brief: "For the past few years, I’ve been deep in the world of software development, building, debugging, learning, and growing. A lot of that work has lived quietly in the background: private repos, team chats, internal tools, late-night experiments that never made it out into the world.",
    slug: "sharing-my-work",
    dateAdded: "2025-08-06",
    readTime: 2,
    tags: []
  }
];

export default blogs;