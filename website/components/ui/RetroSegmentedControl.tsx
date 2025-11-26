"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * RetroSegmentedControl - Compact toggle/switch component
 *
 * Diegetic design: Game menu toggle switch with satisfying feedback
 * Simpler than RetroTabs - for binary or tri-state switches
 * Perfect for: Season toggles, view modes, simple filters
 */

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface RetroSegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    container: "p-0.5 gap-0.5 rounded",
    button: "px-3 py-1.5 text-xs rounded-sm",
    icon: 14,
  },
  md: {
    container: "p-1 gap-1 rounded",
    button: "px-4 py-2 text-xs rounded-sm",
    icon: 16,
  },
  lg: {
    container: "p-1.5 gap-1 rounded-lg",
    button: "px-6 py-2.5 text-sm rounded-md",
    icon: 18,
  },
};

export default function RetroSegmentedControl({
  options,
  value,
  onChange,
  size = "md",
  className
}: RetroSegmentedControlProps) {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <div
      className={cn(
        "inline-flex bg-surface-dark border border-white/10",
        sizeStyle.container,
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative font-ui uppercase tracking-wider transition-all focus-arcade",
              sizeStyle.button,
              isActive
                ? "text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
            whileHover={!isActive ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            {/* Active background with glow */}
            {isActive && (
              <>
                <motion.div
                  layoutId="segmentedControlBg"
                  className="absolute inset-0 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                  style={{
                    borderRadius: size === "lg" ? "0.375rem" : "0.125rem"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </>
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              {Icon && <Icon size={sizeStyle.icon} />}
              {option.label}
            </span>

            {/* Subtle power-up effect on hover */}
            {!isActive && (
              <motion.div
                className="absolute inset-0 bg-comets-cyan/0 pointer-events-none"
                whileHover={{
                  backgroundColor: "rgba(0,243,255,0.02)"
                }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Convenience component for Season Toggle
 * Pre-configured for Regular Season / Playoffs switching
 */
export function SeasonToggle({
  isPlayoffs,
  onChange,
  size = "md",
  className
}: {
  isPlayoffs: boolean;
  onChange: (isPlayoffs: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <RetroSegmentedControl
      options={[
        { value: "regular", label: "Regular Season" },
        { value: "playoffs", label: "Playoffs" }
      ]}
      value={isPlayoffs ? "playoffs" : "regular"}
      onChange={(val) => onChange(val === "playoffs")}
      size={size}
      className={className}
    />
  );
}
