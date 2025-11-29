"use client";

import { motion } from "framer-motion";

/**
 * Template component for page transitions
 *
 * In Next.js App Router, template.tsx runs on every navigation,
 * making it perfect for page transition animations.
 *
 * Unlike layout.tsx (which persists across navigations),
 * template.tsx re-mounts on each route change.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1] // Custom ease for smooth feel
      }}
    >
      {children}
    </motion.div>
  );
}
