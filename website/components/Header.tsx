"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Trophy, Calendar, Users, Activity, UserCircle, Wrench, Scale, Sliders, Link2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Players", href: "/players", icon: UserCircle },
    { name: "Stats", href: "/leaders", icon: Activity },
  ];

  const toolItems = [
    { name: "Lineup Builder", href: "/tools/lineup", icon: Users, color: "comets-cyan" },
    { name: "Compare Players", href: "/tools/compare", icon: Scale, color: "comets-yellow" },
    { name: "Attributes", href: "/tools/attributes", icon: Sliders, color: "comets-purple" },
    { name: "Chemistry", href: "/tools/chemistry", icon: Link2, color: "comets-green" },
  ];

  const isToolsActive = pathname?.startsWith("/tools");

  return (
    <>
      <header className="fixed top-0 left-0 md:left-64 right-0 z-40 grid grid-cols-3 items-center px-6 py-4 border-b border-white/10 bg-background/80 backdrop-blur-md">
        {/* Subtle scanlines overlay */}
        <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none" />

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-4 group relative z-10 justify-self-start">
          <motion.div
            className="w-10 h-10 flex items-center justify-center"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.08, 1],
              filter: [
                "drop-shadow(0 0 4px rgba(255, 107, 0, 0.4))",
                "drop-shadow(0 0 10px rgba(255, 107, 0, 0.7))",
                "drop-shadow(0 0 4px rgba(255, 107, 0, 0.4))",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/icons/Comets.png"
              alt="Comets League"
              width={40}
              height={40}
              className="object-contain"
            />
          </motion.div>
          <span
            className="hidden md:block font-display text-xl tracking-wider text-white"
            style={{ textShadow: '0 0 10px rgba(255, 107, 0, 0.4)' }}
          >CLB</span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1 relative bg-surface-light/50 border border-white/5 rounded-full px-2 py-1 justify-self-center">
          {/* HUD accent corners */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-comets-cyan/60" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-comets-cyan/60" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-comets-cyan/60" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-comets-cyan/60" />

          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href) && item.href !== "/";
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-6 py-2 rounded-full font-ui uppercase tracking-widest text-sm transition-all duration-200 group flex items-center gap-2 focus-arcade",
                  isActive ? "text-black" : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-comets-yellow rounded-full"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ scale: isActive ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && <item.icon size={14} />}
                  {item.name}
                </motion.span>
              </Link>
            );
          })}

          {/* Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsToolsOpen(true)}
            onMouseLeave={() => setIsToolsOpen(false)}
          >
            <button
              className={cn(
                "relative px-6 py-2 rounded-full font-ui uppercase tracking-widest text-sm transition-all duration-200 flex items-center gap-1.5 focus-arcade",
                isToolsActive ? "text-black" : "text-white/60 hover:text-white"
              )}
            >
              {isToolsActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-comets-yellow rounded-full"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {isToolsActive && <Wrench size={14} />}
                Tools
                <ChevronDown size={12} className={cn("transition-transform", isToolsOpen && "rotate-180")} />
              </span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-surface-dark/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-xl"
                >
                  {/* HUD corners on dropdown */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-comets-cyan/80" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-comets-cyan/80" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-comets-cyan/80" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-comets-cyan/80" />

                  <div className="p-1">
                    {toolItems.map((tool, idx) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <tool.icon size={16} className={`text-${tool.color}`} />
                          <span className="font-ui text-sm">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right: Mobile menu button */}
        <div className="flex items-center gap-2 relative z-10 justify-self-end">
          <motion.button
            className="md:hidden p-2 text-white hover:text-comets-yellow transition-colors focus-arcade"
            onClick={() => setIsMobileMenuOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </motion.button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-surface-dark border-l border-white/10 z-50 md:hidden flex flex-col shadow-2xl"
            >
              {/* Scanlines overlay */}
              <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

              {/* Menu Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                <div className="font-display text-xl text-white tracking-wider">
                  SYSTEM <span className="text-comets-yellow glow-yellow">MENU</span>
                </div>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/50 hover:text-white transition-colors focus-arcade"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto relative z-10">
                {navItems.map((item, index) => {
                  const isActive = pathname?.startsWith(item.href) && item.href !== "/";
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "group flex items-center gap-4 p-4 rounded-lg border transition-all arcade-press focus-arcade",
                          isActive
                            ? "bg-white/10 border-comets-yellow/50"
                            : "border-transparent hover:border-white/10 hover:bg-white/5"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded transition-colors",
                            isActive ? "bg-comets-yellow/20 text-comets-yellow" : "bg-black/50 text-white/60 group-hover:text-comets-cyan"
                          )}
                        >
                          <item.icon size={24} />
                        </div>
                        <span className={cn(
                          "font-ui uppercase tracking-widest text-lg transition-colors",
                          isActive ? "text-white" : "text-white/80 group-hover:text-white"
                        )}>
                          {item.name}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveNav"
                            className="ml-auto w-2 h-2 rounded-full bg-comets-yellow power-indicator"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Tools Section */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="mt-2 pt-4 border-t border-white/10"
                >
                  <div className="px-4 pb-2 text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Wrench size={12} />
                    Tools
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {toolItems.map((tool) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                            isActive
                              ? "bg-white/10 border-comets-yellow/50"
                              : "border-white/5 hover:border-white/10 hover:bg-white/5"
                          )}
                        >
                          <tool.icon size={20} className={`text-${tool.color}`} />
                          <span className="font-ui text-xs text-white/80 text-center">
                            {tool.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Menu Footer */}
              <div className="p-6 border-t border-white/10 text-center relative z-10">
                <div className="text-xs font-mono text-white/20 uppercase tracking-widest">
                  Comets League System v2.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
