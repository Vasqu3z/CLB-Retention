"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamInfo {
  name: string;
  code: string;
  logoColor: string;
  score?: number;
}

interface VersusCardProps {
  home: TeamInfo;
  away: TeamInfo;
  date: string;
  time: string;
  isFinished: boolean;
}

export default function VersusCard({ home, away, date, time, isFinished }: VersusCardProps) {
  return (
    <motion.div 
      className="group relative w-full h-32 bg-surface-dark border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer focus-arcade"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300 }}
      tabIndex={0}
      role="article"
      aria-label={`Match between ${home.name} and ${away.name} on ${date} at ${time}`}
    >
      
      {/* Background Split with animation */}
      <div className="absolute inset-0 flex">
        <motion.div 
          className="w-[55%] h-full skew-x-12 -ml-4 opacity-20"
          style={{ backgroundColor: home.logoColor }}
          whileHover={{ width: "60%", opacity: 0.4 }}
          transition={{ duration: 0.5 }}
        />
        <div className="flex-1 h-full bg-black/50" />
        <motion.div 
          className="absolute right-0 top-0 bottom-0 w-[55%] skew-x-12 -mr-4 opacity-20"
          style={{ backgroundColor: away.logoColor }}
          whileHover={{ width: "60%", opacity: 0.4 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Content Grid */}
      <div className="absolute inset-0 flex items-center justify-between px-8 z-10">
        
        {/* Home Team - slides left on hover */}
        <motion.div 
          className="flex items-center gap-4 text-left w-1/3"
          whileHover={{ x: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="text-4xl font-display text-white"
            whileHover={{ scale: 1.1 }}
          >
            {home.code}
          </motion.div>
          <div className="hidden md:block font-ui uppercase tracking-wider text-sm text-white/60 group-hover:text-white/80 transition-colors">
            {home.name}
          </div>
        </motion.div>

        {/* Center - Score or VS */}
        <div className="flex flex-col items-center justify-center w-1/3">
          {isFinished ? (
            <motion.div 
              className="flex items-center gap-4 font-mono text-3xl font-bold text-white bg-black/50 px-4 py-1 rounded border border-white/10 backdrop-blur-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Winning score glows */}
              <motion.span 
                className={home.score! > away.score! ? "text-comets-yellow" : "text-white/50"}
                animate={home.score! > away.score! ? { 
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 0px #F4D03F", 
                    "0 0 10px #F4D03F", 
                    "0 0 0px #F4D03F"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {home.score}
              </motion.span>
              <span className="text-sm text-white/20">-</span>
              <motion.span 
                className={away.score! > home.score! ? "text-comets-yellow" : "text-white/50"}
                animate={away.score! > home.score! ? { 
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 0px #F4D03F", 
                    "0 0 10px #F4D03F", 
                    "0 0 0px #F4D03F"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {away.score}
              </motion.span>
            </motion.div>
          ) : (
            <motion.div 
              className="font-display text-4xl text-white/10 italic"
              whileHover={{ 
                scale: 1.25, 
                color: "rgba(0, 243, 255, 0.8)",
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.3 }}
            >
              VS
            </motion.div>
          )}
          
          {/* Date/Time */}
          <motion.div 
            className="mt-1 text-[10px] font-mono text-white/40 uppercase tracking-widest"
            whileHover={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            {date} • {time}
          </motion.div>
        </div>

        {/* Away Team - slides right on hover */}
        <motion.div 
          className="flex items-center gap-4 justify-end text-right w-1/3"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="hidden md:block font-ui uppercase tracking-wider text-sm text-white/60 group-hover:text-white/80 transition-colors">
            {away.name}
          </div>
          <motion.div 
            className="text-4xl font-display text-white"
            whileHover={{ scale: 1.1 }}
          >
            {away.code}
          </motion.div>
        </motion.div>

      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, ${home.logoColor}20, transparent, ${away.logoColor}20)`
        }}
      />
    </motion.div>
  );
}
