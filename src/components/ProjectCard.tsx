"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/lib/data";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.div
      className="neumorphic p-6 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98, y: 0 }}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <motion.h3
              className="text-xl font-bold tracking-tight text-foreground"
              whileHover={{ color: "var(--color-primary)" }}
            >
              {project.title}
            </motion.h3>
            <motion.p
              className="text-muted-foreground leading-relaxed"
              whileHover={{ color: "var(--color-foreground)" }}
            >
              {project.description}
            </motion.p>
          </div>
          <motion.span
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full neumorphic text-muted-foreground"
            whileHover={{ scale: 1.05 }}
          >
            {project.status}
          </motion.span>
        </div>

        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
        >
          {project.technologies.map((tech) => (
            <motion.span
              key={tech}
              className="inline-flex items-center px-2 py-1 text-xs rounded-md neumorphic text-muted-foreground"
              whileHover={{ scale: 1.05, color: "var(--color-primary)" }}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {project.repository && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          >
            <Link
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <motion.svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <path d="M18 21a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3z" />
                <path d="M12 21a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3z" />
                <path d="M6 21a3 3 0 0 0 3-3 3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3z" />
                <path d="M18 12c0-3.31-2.69-6-6-6s-6 2.69-6 6" />
                <path d="M18 9v-4" />
                <path d="M6 9v-4" />
              </motion.svg>
              <motion.span whileHover={{ x: 2 }}>View Repository</motion.span>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}