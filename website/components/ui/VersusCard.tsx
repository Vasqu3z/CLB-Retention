"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamInfo {
  name: string;
  code: string;
  logoColor: string;
  logoUrl?: string;
  score?: number;
}

export type GameStatus = 'live' | 'next' | null;

interface VersusCardProps {
  home: TeamInfo;
  away: TeamInfo;
  date: string;
  time: string;
  isFinished: boolean;
  compact?: boolean;
  status?: GameStatus; // 'live' for current game, 'next' for upcoming
}

export default function VersusCard({ home, away, date, time, isFinished, compact = false, status }: VersusCardProps) {
  // Compact mode for grid layouts
  if (compact) {
    return (
      <div
        className={cn(
          "group relative bg-surface-dark border rounded-lg overflow-hidden transition-colors duration-200 cursor-pointer",
          isFinished ? "opacity-100 border-white/10" : "opacity-80 border-white/10",
          status === 'live' && "border-comets-red/50 shadow-[0_0_15px_rgba(255,77,77,0.2)]",
          status === 'next' && "border-comets-cyan/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]",
          !status && "hover:border-white/20"
        )}
      >
        {/* Status bar with LIVE/NEXT badge */}
        <div className={cn(
          "px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border-b border-white/5 flex items-center justify-between",
          isFinished ? "text-comets-yellow/80" : "text-white/40"
        )}>
          <span>{isFinished ? "Final" : "Upcoming"}</span>
          {/* LIVE Badge */}
          {status === 'live' && (
            <motion.span
              className="flex items-center gap-1.5 px-2 py-0.5 bg-comets-red/20 text-comets-red border border-comets-red/40 rounded text-[9px] font-bold"
              animate={{
                boxShadow: ['0 0 5px rgba(255,77,77,0.3)', '0 0 15px rgba(255,77,77,0.6)', '0 0 5px rgba(255,77,77,0.3)']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-comets-red"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              LIVE
            </motion.span>
          )}
          {/* NEXT Badge */}
          {status === 'next' && (
            <motion.span
              className="flex items-center gap-1.5 px-2 py-0.5 bg-comets-cyan/20 text-comets-cyan border border-comets-cyan/40 rounded text-[9px] font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                →
              </motion.span>
              NEXT
            </motion.span>
          )}
        </div>

        {/* Teams */}
        <div className="p-3 space-y-2">
          {/* Away Team */}
          <div className={cn(
            "flex items-center justify-between gap-2 p-2 rounded",
            isFinished && away.score! > home.score! ? "bg-comets-cyan/10" : "bg-white/5"
          )}>
            <div className="flex items-center gap-2 min-w-0">
              {away.logoUrl ? (
                <Image src={away.logoUrl} alt="" width={20} height={20} className="object-contain flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `${away.logoColor}30`, color: away.logoColor }}>
                  {away.code[0]}
                </div>
              )}
              <span className={cn(
                "font-ui text-xs uppercase truncate",
                isFinished && away.score! > home.score! ? "text-white font-bold" : "text-white/70"
              )}>
                {away.name}
              </span>
            </div>
            <span className={cn(
              "font-mono text-sm font-bold flex-shrink-0",
              isFinished && away.score! > home.score! ? "text-comets-cyan" : "text-white/50"
            )}>
              {isFinished ? away.score : "-"}
            </span>
          </div>

          {/* Home Team */}
          <div className={cn(
            "flex items-center justify-between gap-2 p-2 rounded",
            isFinished && home.score! > away.score! ? "bg-comets-cyan/10" : "bg-white/5"
          )}>
            <div className="flex items-center gap-2 min-w-0">
              {home.logoUrl ? (
                <Image src={home.logoUrl} alt="" width={20} height={20} className="object-contain flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `${home.logoColor}30`, color: home.logoColor }}>
                  {home.code[0]}
                </div>
              )}
              <span className={cn(
                "font-ui text-xs uppercase truncate",
                isFinished && home.score! > away.score! ? "text-white font-bold" : "text-white/70"
              )}>
                {home.name}
              </span>
            </div>
            <span className={cn(
              "font-mono text-sm font-bold flex-shrink-0",
              isFinished && home.score! > away.score! ? "text-comets-cyan" : "text-white/50"
            )}>
              {isFinished ? home.score : "-"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full version with animations
  return (
    <motion.div
      className={cn(
        "group relative w-full h-32 bg-surface-dark border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer focus-arcade",
        status === 'live' ? "border-comets-red/50 shadow-[0_0_20px_rgba(255,77,77,0.25)]" :
        status === 'next' ? "border-comets-cyan/50 shadow-[0_0_20px_rgba(0,243,255,0.25)]" :
        "border-white/10 hover:border-white/30"
      )}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      tabIndex={0}
      role="article"
      aria-label={`Match between ${home.name} and ${away.name} on ${date} at ${time}`}
    >
      {/* LIVE Badge (full version - top right corner) */}
      {status === 'live' && (
        <motion.div
          className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-comets-red/90 text-white border border-comets-red rounded-lg text-xs font-bold uppercase tracking-wider"
          animate={{
            boxShadow: ['0 0 10px rgba(255,77,77,0.4)', '0 0 25px rgba(255,77,77,0.7)', '0 0 10px rgba(255,77,77,0.4)']
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-white"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          LIVE
        </motion.div>
      )}

      {/* NEXT Badge (full version - top right corner) */}
      {status === 'next' && (
        <motion.div
          className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-comets-cyan/90 text-background border border-comets-cyan rounded-lg text-xs font-bold uppercase tracking-wider"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            →
          </motion.span>
          UP NEXT
        </motion.div>
      )}

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
          {home.logoUrl ? (
            <motion.div
              className="w-12 h-12 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Image
                src={home.logoUrl}
                alt={`${home.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              className="text-4xl font-display text-white"
              whileHover={{ scale: 1.1 }}
            >
              {home.code}
            </motion.div>
          )}
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
          {away.logoUrl ? (
            <motion.div
              className="w-12 h-12 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Image
                src={away.logoUrl}
                alt={`${away.name} logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              className="text-4xl font-display text-white"
              whileHover={{ scale: 1.1 }}
            >
              {away.code}
            </motion.div>
          )}
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
