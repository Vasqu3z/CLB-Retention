"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HUDCornerProps {
  position: "tl" | "tr" | "bl" | "br";
  size?: "sm" | "md" | "lg";
  color?: string;
  animate?: boolean;
  delay?: number;
}

const sizeClasses = {
  sm: "w-4 h-4 md:w-6 md:h-6",
  md: "w-8 h-8 md:w-12 md:h-12",
  lg: "w-12 h-12 md:w-16 md:h-16",
};

const offsetClasses = {
  sm: {
    top: "top-2 md:top-4",
    bottom: "bottom-2 md:bottom-4",
    left: "left-2 md:left-4",
    right: "right-2 md:right-4",
  },
  md: {
    top: "top-4 md:top-8",
    bottom: "bottom-4 md:bottom-8",
    left: "left-4 md:left-8",
    right: "right-4 md:right-8",
  },
  lg: {
    top: "top-6 md:top-10",
    bottom: "bottom-6 md:bottom-10",
    left: "left-6 md:left-10",
    right: "right-6 md:right-10",
  },
};

// Map color names to CSS variable references
const colorMap: Record<string, string> = {
  "comets-cyan": "var(--comets-cyan)",
  "comets-yellow": "var(--comets-yellow)",
  "comets-purple": "var(--comets-purple)",
  "comets-red": "var(--comets-red)",
  "comets-blue": "var(--comets-blue)",
};

/**
 * Single HUD corner bracket for diegetic arcade framing
 */
export const HUDCorner = ({
  position,
  size = "md",
  color = "comets-cyan",
  animate = true,
  delay = 0.3,
}: HUDCornerProps) => {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");
  const offsets = offsetClasses[size];
  const colorValue = colorMap[color] || color;

  const content = (
    <>
      <div
        className={cn(
          "absolute w-full h-[2px]",
          isTop ? "top-0" : "bottom-0"
        )}
        style={{
          background: `linear-gradient(to ${isLeft ? "right" : "left"}, ${colorValue}, transparent)`,
        }}
      />
      <div
        className={cn(
          "absolute h-full w-[2px]",
          isLeft ? "left-0" : "right-0"
        )}
        style={{
          background: `linear-gradient(to ${isTop ? "bottom" : "top"}, ${colorValue}, transparent)`,
        }}
      />
    </>
  );

  const className = cn(
    "absolute pointer-events-none z-20",
    sizeClasses[size],
    isTop ? offsets.top : offsets.bottom,
    isLeft ? offsets.left : offsets.right
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5, type: "spring" }}
        className={className}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={className}>{content}</div>;
};

interface HUDFrameProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  animate?: boolean;
  delay?: number;
  /** Include scanlines overlay */
  scanlines?: boolean;
  /** Scanlines opacity (0.01 - 0.2) */
  scanlinesOpacity?: number;
}

/**
 * HUD Frame wrapper that adds arcade cabinet-style corner brackets
 * Used to create diegetic framing around content sections
 */
export default function HUDFrame({
  children,
  className,
  size = "md",
  color = "comets-cyan",
  animate = true,
  delay = 0.3,
  scanlines = false,
  scanlinesOpacity = 0.05,
}: HUDFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Scanlines overlay */}
      {scanlines && (
        <div
          className="absolute inset-0 scanlines pointer-events-none z-10"
          style={{ opacity: scanlinesOpacity }}
        />
      )}

      {/* HUD corners */}
      <HUDCorner position="tl" size={size} color={color} animate={animate} delay={delay} />
      <HUDCorner position="tr" size={size} color={color} animate={animate} delay={delay + 0.05} />
      <HUDCorner position="bl" size={size} color={color} animate={animate} delay={delay + 0.1} />
      <HUDCorner position="br" size={size} color={color} animate={animate} delay={delay + 0.15} />

      {children}
    </div>
  );
}
