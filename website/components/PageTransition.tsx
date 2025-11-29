"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition - Smooth entrance animations for page content
 *
 * Wraps page content with a fade-and-slide-up animation
 * for a polished transition effect between routes.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] // Custom ease for smooth feel
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransitionFade - Simple fade transition
 */
export function PageTransitionFade({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransitionSlide - Horizontal slide transition
 */
export function PageTransitionSlide({
  children,
  direction = "right"
}: PageTransitionProps & { direction?: "left" | "right" }) {
  const xOffset = direction === "right" ? 50 : -50;

  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -xOffset }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredPageTransition - For pages with multiple sections
 * that should animate in sequence
 */
export function StaggeredPageTransition({
  children,
  staggerDelay = 0.1
}: PageTransitionProps & { staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredChild - Individual child for StaggeredPageTransition
 */
export function StaggeredChild({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}
