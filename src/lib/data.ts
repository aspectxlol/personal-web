export interface Project {
  id: string;
  title: string;
  description: string;
  status: "In Development" | "Completed" | "Experimental";
  technologies: string[];
  href?: string;
  repository?: string;
}

export const projects = [
  {
    id: "personal-web",
    title: "Personal Portfolio",
    description:
      "A personal portfolio showcasing my engineering mindset, projects, and the systems I build.",
    status: "In Development",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Motion", "Vercel"],
    repository: "https://github.com/aspectxlol/personal-web",
  },
  {
    id: "lnq",
    title: "LnQ Cake & Cookies",
    description:
      "A full-stack bakery management system built for a real family business, covering order management, authentication, and operational workflows.",
    status: "In Development",
    technologies: [
      "TypeScript",
      "NestJS",
      "Fastify",
      "PostgreSQL",
      "Drizzle ORM",
      "Docker",
    ],
    repository: "https://github.com/aspectxlol/lnq",
  },
  {
    id: "edwin",
    title: "Edwin",
    description:
      "A modular personal AI assistant with a TypeScript core, pluggable AI providers, messaging interfaces, and callable tools.",
    status: "In Development",
    technologies: [
      "TypeScript",
      "Node.js",
      "Python",
      "Baileys",
      "OpenRouter",
      "Docker",
    ],
    repository: null,
  },
  {
    id: "escpos",
    title: "ESC/POS Printer Library",
    description:
      "A developer-focused library for generating receipt printer commands and communicating with network-connected thermal printers.",
    status: "In Development",
    technologies: ["TypeScript", "Node.js", "TCP", "ESC/POS"],
    repository: null,
  },
  {
    id: "escpos-visualizer",
    title: "ESC/POS Visualizer",
    description:
      "A browser-based receipt preview tool for visualizing thermal printer output during receipt development.",
    status: "In Development",
    technologies: ["TypeScript", "React", "Vite"],
    repository: null,
  },
  {
    id: "home-server",
    title: "Turing Home Server",
    description:
      "A self-hosted infrastructure environment for experimenting with Linux server administration, containerized services, reverse proxies, and home-network services.",
    status: "In Development",
    technologies: ["Ubuntu Server", "Docker", "Caddy", "PostgreSQL", "Linux"],
    repository: null,
  },
];
