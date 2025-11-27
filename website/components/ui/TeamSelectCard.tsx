"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

interface TeamSelectCardProps {
  name: string;
  code: string;
  logoColor: string;
  logoUrl?: string; // Optional logo URL
  stats: {
    wins: number;
    losses: number;
    avg: string;
  };
  href: string;
}

export default function TeamSelectCard({ name, code, logoColor, logoUrl, stats, href }: TeamSelectCardProps) {
  return (
    <Link href={href} className="block h-full group perspective-1000">
      <motion.div
        whileHover={{ scale: 1.05, rotateX: 5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-64 bg-surface-dark border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 shadow-lg focus-arcade cursor-pointer"
        tabIndex={0}
      >
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-transparent to-black"
          style={{ background: `linear-gradient(to bottom, ${logoColor}20, transparent)` }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Animated team logo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-0 grayscale group-hover:grayscale-0"
          initial={{ opacity: 0.2, scale: 1 }}
          whileHover={{
            opacity: 1,
            scale: 1.15,
            rotate: [0, -3, 3, 0],
          }}
          transition={{ duration: 0.5 }}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${name} logo`}
              width={200}
              height={200}
              className="object-contain"
            />
          ) : (
            <div className="text-9xl font-display" style={{ color: logoColor }}>{code[0]}</div>
          )}
        </motion.div>

        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-between items-start">
            <motion.div 
              className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs font-mono text-white/60 backdrop-blur-sm"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              {code}
            </motion.div>
            <motion.div 
              className="text-white/40 group-hover:text-comets-yellow transition-colors"
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <TrendingUp size={20} />
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-display text-2xl text-white leading-none mb-2 group-hover:text-shadow-neon transition-all">
              {name}
            </h3>
            <div className="flex gap-4 text-sm font-mono text-white/60">
              <motion.span 
                whileHover={{ scale: 1.1, color: "#ffffff" }}
                className="transition-colors"
              >
                <span className="text-white">W:</span> {stats.wins}
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1, color: "#ffffff" }}
                className="transition-colors"
              >
                <span className="text-white">L:</span> {stats.losses}
              </motion.span>
              <motion.span 
                className="text-comets-cyan"
                whileHover={{ scale: 1.1 }}
              >
                {stats.avg} AVG
              </motion.span>
            </div>
          </motion.div>
        </div>
        
        {/* Pulsing border effect on hover */}
        <motion.div 
          className="absolute inset-0 border-2 rounded-xl pointer-events-none" 
          style={{ borderColor: logoColor }}
          initial={{ opacity: 0 }}
          whileHover={{ 
            opacity: 0.6,
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            scale: { duration: 1.5, repeat: Infinity }
          }}
        />

        {/* Corner accent */}
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-20"
          style={{ 
            background: `radial-gradient(circle at top right, ${logoColor}, transparent)`
          }}
          initial={{ scale: 0, rotate: 0 }}
          whileHover={{ scale: 1, rotate: 45 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </Link>
  );
}
