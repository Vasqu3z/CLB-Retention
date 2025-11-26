"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * RetroTabs - Arcade-style tab navigation with sliding background
 *
 * Diegetic design: Game menu tab selector with animated background
 * Uses layoutId for smooth sliding animation between options
 * Supports 2-4 tabs with custom colors per tab
 */

export interface RetroTab {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  color?: "yellow" | "cyan" | "red" | "purple" | "blue";
}

interface RetroTabsProps {
  tabs: RetroTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const COLOR_MAP = {
  yellow: "bg-comets-yellow",
  cyan: "bg-comets-cyan",
  red: "bg-comets-red",
  purple: "bg-comets-purple",
  blue: "bg-comets-blue",
};

export default function RetroTabs({ tabs, value, onChange, className }: RetroTabsProps) {
  return (
    <div className={cn("inline-flex bg-surface-dark border border-white/10 rounded-lg p-2 gap-1", className)}>
      {tabs.map((tab, index) => {
        const isActive = value === tab.value;
        const Icon = tab.icon;
        const bgColor = COLOR_MAP[tab.color || "yellow"];

        return (
          <motion.button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative px-6 py-3 font-ui uppercase tracking-widest text-sm transition-all rounded-lg focus-arcade",
              isActive ? "text-black" : "text-white/60 hover:text-white"
            )}
          >
            {/* Animated background */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={cn("absolute inset-0 rounded-lg", bgColor)}
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }}
              />
            )}

            {/* Tab content */}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon size={16} />}
              {tab.label}
            </span>

            {/* Hover glow effect */}
            {!isActive && (
              <motion.div
                className="absolute inset-0 bg-white/0 rounded-lg"
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)"
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
