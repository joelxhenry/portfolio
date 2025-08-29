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
    brief: "Explore the fundamentals of Kubernetes and how it transformed my approach to container orchestration in modern DevOps practices.",
    slug: "sharing-my-work",
    dateAdded: "2025-10-06",
    readTime: 2,
    tags: []
  }
];

export default blogs;