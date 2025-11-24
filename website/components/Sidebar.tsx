"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  Users,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  Swords
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { name: "Standings", href: "/standings", icon: Trophy, color: "text-comets-yellow" },
  { name: "Schedule", href: "/schedule", icon: Calendar, color: "text-comets-red" },
  { name: "Teams", href: "/teams", icon: Users, color: "text-comets-blue" },
  { name: "Players", href: "/players", icon: Users, color: "text-comets-cyan" },
  { name: "Lineup.exe", href: "/tools/lineup", icon: Activity, color: "text-comets-purple" },
  { name: "Head-to-Head", href: "/tools/compare", icon: Swords, color: "text-comets-cyan" },
];

export default function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <div className="w-full h-full flex flex-col bg-surface-dark border-r border-white/10 relative overflow-hidden group/sidebar">
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

      <motion.div
        className="p-6 border-b border-white/10 bg-black/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-2">
          System Menu
        </div>
        <div className="font-display text-xl text-white tracking-wider">
          MAIN <span className="text-comets-yellow glow-yellow">DECK</span>
        </div>
      </motion.div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {MENU_ITEMS.map((item, index) => {
          const isActive = pathname?.startsWith(item.href);
          const isHovered = hoveredItem === item.name;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300
              }}
            >
              <Link
                href={item.href}
                className="relative block"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  className={cn(
                    "relative z-10 flex items-center justify-between px-4 py-4 rounded-md border transition-all duration-200 group focus-arcade",
                    isActive
                      ? "bg-white/10 border-comets-yellow/50"
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={cn(
                        "p-2 rounded transition-colors",
                        isActive || isHovered ? item.color : "text-white/40",
                        isActive ? "bg-black/50" : "bg-black/30"
                      )}
                      animate={isActive ? {
                        boxShadow: [
                          "0 0 0px currentColor",
                          "0 0 10px currentColor",
                          "0 0 0px currentColor"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                    </motion.div>

                    <div className="flex flex-col">
                      <span className={cn(
                        "font-ui uppercase tracking-widest text-sm transition-colors",
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
                      )}>
                        {item.name}
                      </span>
                      {(isActive || isHovered) && (
                        <motion.span
                          className="text-[10px] font-mono text-white/30 uppercase tracking-tighter leading-none"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          Select &gt;
                        </motion.span>
                      )}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: isActive || isHovered ? 1 : 0,
                      x: isActive || isHovered ? 0 : -10
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={item.color}
                  >
                    <ChevronRight size={16} />
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-comets-yellow rounded-l-md shadow-[0_0_10px_rgba(244,208,63,0.5)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="p-4 border-t border-white/10 bg-black/20 flex gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded border border-white/5 hover:border-white/20 transition-colors flex justify-center text-white/40 hover:text-white focus-arcade"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Settings"
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Settings size={18} />
          </motion.div>
        </motion.button>
        <motion.button
          className="flex-1 p-3 bg-white/5 hover:bg-red-500/10 rounded border border-white/5 hover:border-red-500/30 transition-colors flex justify-center text-white/40 hover:text-red-400 focus-arcade"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Logout"
        >
          <LogOut size={18} />
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-comets-cyan/20 to-transparent opacity-0 group-hover/sidebar:opacity-100 pointer-events-none"
        animate={{
          y: ["-100%", "100%"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}
