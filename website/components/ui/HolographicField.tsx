"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const POSITIONS = {
  P: { top: "50%", left: "50%" },
  C: { top: "85%", left: "50%" },
  "1B": { top: "50%", left: "80%" },
  "2B": { top: "20%", left: "65%" },
  "3B": { top: "50%", left: "20%" },
  SS: { top: "20%", left: "35%" },
  LF: { top: "10%", left: "15%" },
  CF: { top: "5%", left: "50%" },
  RF: { top: "10%", left: "85%" },
};

interface HolographicFieldProps {
  roster: Record<string, any>;
  onPositionClick: (pos: string) => void;
}

export default function HolographicField({ roster, onPositionClick }: HolographicFieldProps) {
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto perspective-1000">
      
      {/* Enhanced field container */}
      <motion.div 
        className="absolute inset-0 transform rotate-x-45 scale-90 bg-black/20 border border-white/10 rounded-full backdrop-blur-sm overflow-hidden"
        animate={{ 
          boxShadow: [
            "0 0 50px rgba(0,243,255,0.1)",
            "0 0 80px rgba(0,243,255,0.2)",
            "0 0 50px rgba(0,243,255,0.1)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        
        {/* More visible grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--comets-cyan) 1px, transparent 1px), linear-gradient(to bottom, var(--comets-cyan) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Enhanced diamond with pulse */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rotate-45 border-2 border-comets-cyan/30"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(0,243,255,0.2)",
              "0 0 40px rgba(0,243,255,0.4)",
              "0 0 20px rgba(0,243,255,0.2)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Dramatic scanning line */}
        <motion.div
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-2 bg-comets-cyan/70 blur-sm"
          style={{
            boxShadow: "0 0 20px var(--comets-cyan), 0 0 40px var(--comets-cyan)"
          }}
        />

        {/* Additional scanning lines for depth */}
        <motion.div 
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute left-0 right-0 h-px bg-comets-cyan/30"
        />
      </motion.div>

      {/* Enhanced position nodes */}
      {Object.entries(POSITIONS).map(([pos, coords]) => {
        const player = roster[pos];
        return (
          <motion.button
            key={pos}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{
              scale: 1.3,
              y: -8,
              boxShadow: player
                ? "0 0 25px var(--comets-yellow)"
                : "0 0 20px var(--comets-cyan)"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400,
              damping: 15
            }}
            onClick={() => onPositionClick(pos)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPositionClick(pos);
              }
            }}
            className={cn(
              "absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 cursor-pointer focus-yellow",
              player
                ? "border-comets-yellow bg-black shadow-[0_0_15px_var(--comets-yellow)]"
                : "border-white/20 bg-black/50 hover:border-comets-cyan hover:bg-comets-cyan/10"
            )}
            style={{ top: coords.top, left: coords.left }}
            tabIndex={0}
            aria-label={`${pos} position${player ? `: ${player.name}` : ' empty'}`}
          >
            {player ? (
              <motion.div 
                className="font-bold text-xs text-comets-yellow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {player.name[0]}
              </motion.div>
            ) : (
              <div className="text-[10px] text-white/50 font-mono">{pos}</div>
            )}
            
            {/* Pulse indicator for filled positions */}
            {player && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-comets-yellow"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Glow ring on hover for empty positions */}
            {!player && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-comets-cyan opacity-0 group-hover:opacity-100"
                animate={{ 
                  scale: [1, 1.3, 1],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                }}
              />
            )}
          </motion.button>
        );
      })}

      {/* Corner indicators */}
      <motion.div
        className="absolute top-4 left-4 text-xs font-mono text-comets-cyan/50 uppercase tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        TACTICAL
      </motion.div>
      <motion.div
        className="absolute top-4 right-4 text-xs font-mono text-comets-cyan/50 uppercase tracking-wider"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        VIEW
      </motion.div>
    </div>
  );
}
