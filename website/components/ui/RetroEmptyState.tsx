"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Search, Trophy, AlertCircle } from "lucide-react";

/**
 * RetroEmptyState - Arcade cabinet empty state
 *
 * Diegetic design: "INSERT COIN" arcade machine waiting state
 * For empty search results, no data states, missing content
 * Animated pulsing with retro-futuristic feel
 */

interface RetroEmptyStateProps {
  title?: string;
  message?: string;
  icon?: "search" | "trophy" | "gamepad" | "alert" | "database";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ICONS = {
  search: Search,
  trophy: Trophy,
  gamepad: Gamepad2,
  alert: AlertCircle,
  database: AlertCircle, // Using AlertCircle as placeholder for database icon
};

export default function RetroEmptyState({
  title = "No Data Available",
  message = "There are currently no entries to display. Check back later or try adjusting your filters.",
  icon = "database",
  action,
  className = ""
}: RetroEmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative text-center py-24 px-8 ${className}`}
    >
      {/* Cosmic background blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-comets-cyan/5 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10">

        {/* Arcade cabinet frame */}
        <motion.div
          className="inline-block relative mb-8"
          animate={{
            y: [0, -8, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 bg-comets-yellow/20 blur-3xl rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Icon container - arcade screen */}
          <div className="relative bg-surface-dark border-4 border-white/10 rounded-2xl p-12 shadow-2xl overflow-hidden">

            {/* Scanlines */}
            <div className="absolute inset-0 scanlines opacity-10" />

            {/* CRT screen glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-comets-cyan/10 via-transparent to-comets-yellow/10" />

            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Icon size={80} className="text-comets-yellow drop-shadow-[0_0_20px_rgba(244,208,63,0.6)]" />
            </motion.div>

            {/* Power indicator */}
            <motion.div
              className="absolute top-4 right-4 w-3 h-3 rounded-full bg-comets-cyan"
              animate={{
                opacity: [1, 0.3, 1],
                boxShadow: [
                  "0 0 10px rgba(0,243,255,0.8)",
                  "0 0 5px rgba(0,243,255,0.4)",
                  "0 0 10px rgba(0,243,255,0.8)"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Title - arcade display font */}
        <motion.h3
          className="font-display text-3xl md:text-4xl uppercase text-white mb-3 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>

        {/* Message - retro terminal style */}
        <motion.div
          className="font-mono text-sm text-white/40 uppercase tracking-[0.3em] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ delay: 0.3, duration: 2, repeat: Infinity }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="text-comets-cyan">▸</span>
            {message}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              _
            </motion.span>
          </span>
        </motion.div>

        {/* Action button */}
        {action && (
          <motion.button
            onClick={action.onClick}
            className="px-8 py-3 bg-comets-yellow text-black font-ui uppercase tracking-widest text-sm rounded-lg arcade-press focus-arcade shadow-lg shadow-comets-yellow/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(244,208,63,0.4)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </motion.button>
        )}

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/10"
              animate={{
                backgroundColor: [
                  "rgba(255,255,255,0.1)",
                  "rgba(0,243,255,0.6)",
                  "rgba(255,255,255,0.1)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
