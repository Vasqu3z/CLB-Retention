"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: "About League", href: "/about", color: "comets-cyan" },
    { name: "Official Rules", href: "/rules", color: "comets-red" },
    { name: "Join Discord", href: "/discord", color: "comets-purple" },
    { name: "Privacy Policy", href: "/privacy", color: "comets-yellow" },
  ];

  return (
    <footer className="relative pt-24 pb-12 border-t border-white/10 bg-background overflow-hidden">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Giant animated background text */}
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-6xl md:text-[12vw] leading-[0.8] text-white/5 select-none pointer-events-none tracking-tighter text-center"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                background: "linear-gradient(90deg, rgba(0,243,255,0.05) 0%, rgba(189,0,255,0.1) 25%, rgba(244,208,63,0.1) 50%, rgba(189,0,255,0.1) 75%, rgba(0,243,255,0.05) 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              PLAY BALL
            </motion.span>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-1 bg-gradient-to-r from-transparent via-comets-cyan to-transparent"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Footer links with staggered entrance */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 font-ui uppercase tracking-widest text-sm md:text-base text-white/40 mb-12">
          {links.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className={cn(
                  "relative border-b-2 border-transparent transition-all duration-300 focus-arcade group inline-block",
                  `hover:text-${link.color} hover:border-${link.color}`
                )}
              >
                <motion.span
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-block"
                >
                  {link.name}
                </motion.span>

                {/* Underline effect */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-[2px] bg-${link.color}`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Copyright with pulse */}
        <motion.div
          className="text-center font-mono text-xs text-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            animate={{
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            © {currentYear} Comets League Baseball. Not affiliated with Nintendo.
          </motion.span>
        </motion.div>

        {/* Decorative corner accents */}
        <motion.div
          className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/5"
          animate={{
            borderColor: ["rgba(255,255,255,0.05)", "rgba(0,243,255,0.2)", "rgba(255,255,255,0.05)"]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/5"
          animate={{
            borderColor: ["rgba(255,255,255,0.05)", "rgba(244,208,63,0.2)", "rgba(255,255,255,0.05)"]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Floating particles in background */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/10 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}
    </footer>
  );
}
