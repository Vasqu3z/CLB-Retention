"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface RetroCardProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  href: string;
  color: string;
  delay?: number;
}

const RetroCard = ({ title, subtitle, icon: Icon, href, color, delay = 0 }: RetroCardProps) => {
  return (
    <Link href={href} className="block h-full no-underline group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.5 }}
        className="relative h-full min-h-[240px] p-8 bg-surface-dark border border-white/5 hover:border-white/20 transition-colors duration-300 overflow-hidden rounded-xl cursor-pointer focus-arcade"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = href;
          }
        }}
      >
        {/* Radial glow on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="mb-6 flex items-center justify-between">
            {/* Icon with hover scale */}
            <motion.div 
              className="p-3 rounded-lg bg-white/5 text-white"
              style={{ color: color }}
              whileHover={{ 
                scale: 1.15, 
                rotate: [0, -5, 5, 0],
                backgroundColor: "rgba(255,255,255,0.1)"
              }}
              transition={{ duration: 0.3 }}
            >
              {Icon && <Icon size={32} strokeWidth={1.5} />}
            </motion.div>
            
            {/* Animated arrow */}
            <motion.div
              animate={{ 
                x: [0, 5, 0],
                opacity: [0.2, 1, 0.2]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <ArrowRight className="text-white/20 group-hover:text-white transition-colors duration-300" />
            </motion.div>
          </div>
          
          {/* Content with hover lift */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-display text-2xl md:text-3xl text-white mb-2 uppercase leading-none tracking-tight group-hover:text-shadow-neon transition-all">
              {title}
            </h3>
            <p className="font-body text-white/70 text-sm md:text-base mt-2 group-hover:text-white/90 transition-colors">
              {subtitle}
            </p>
          </motion.div>
        </div>

        {/* Accent corner */}
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-30 pointer-events-none"
          style={{ 
            background: `linear-gradient(135deg, transparent 0%, ${color} 100%)`
          }}
          initial={{ scale: 0, rotate: 0 }}
          whileHover={{ scale: 1, rotate: 45 }}
          transition={{ duration: 0.3 }}
        />

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-50"
          style={{ 
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`
          }}
          initial={{ width: "0%" }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </Link>
  );
};

export default RetroCard;
