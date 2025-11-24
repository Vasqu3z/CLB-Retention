"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Trophy, Calendar, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Stats", href: "/leaders", icon: Users },
    { name: "Lineup.exe", href: "/tools/lineup", icon: Activity },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-4 group">
          <motion.div
            className="w-10 h-10 bg-comets-yellow rounded-sm flex items-center justify-center font-display text-black text-xl shadow-lg power-indicator"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            C
          </motion.div>
          <div className="hidden md:flex flex-col">
            <span className="font-display text-lg tracking-wider leading-none text-white">COMETS</span>
            <span className="font-ui text-xs tracking-[0.3em] text-comets-cyan leading-none">LEAGUE</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-surface-light/50 border border-white/5 rounded-full px-2 py-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href) && item.href !== "/";
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-6 py-2 rounded-full font-ui uppercase tracking-widest text-sm transition-all duration-300 group flex items-center gap-2 focus-arcade",
                  isActive ? "text-black" : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-comets-yellow rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isActive && <item.icon size={14} />}
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 text-white/60 hover:text-comets-cyan hover:bg-white/10 rounded-full transition-colors focus-arcade"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} strokeWidth={1.5} />
          </motion.button>

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
