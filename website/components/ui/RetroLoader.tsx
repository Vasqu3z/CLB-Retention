"use client";

import React from "react";
import { motion } from "framer-motion";

export default function RetroLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 min-h-[300px] w-full">
      <div className="relative w-16 h-16">
        {/* Main spinner */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full rounded-full border-4 border-comets-yellow bg-black relative overflow-hidden shadow-[0_0_20px_var(--comets-yellow)]"
        >
          <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full scale-75 opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-comets-yellow/20 rounded-full blur-sm" />
        </motion.div>
        
        {/* Orbiting particles */}
        {[0, 120, 240].map((rotation, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -4,
              marginLeft: -4,
              background: i === 0 ? "var(--comets-cyan)" : i === 1 ? "var(--comets-purple)" : "var(--comets-red)",
              boxShadow: `0 0 8px currentColor`
            }}
            animate={{
              rotate: rotation,
              x: [0, 35],
            }}
            transition={{
              rotate: { duration: 0, ease: "linear" },
              x: {
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3
              },
            }}
          />
        ))}

        {/* Inner rotating ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-comets-cyan/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer pulsing ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex flex-col items-center text-center"
      >
        <div className="font-display text-2xl text-white tracking-widest">
          LOADING
        </div>
        <motion.div
          className="text-xs font-mono text-comets-cyan uppercase tracking-[0.5em] mt-2"
          animate={{
            textShadow: [
              "0 0 0px var(--comets-cyan)",
              "0 0 10px var(--comets-cyan)",
              "0 0 0px var(--comets-cyan)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Insert Coin
        </motion.div>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
              backgroundColor: [
                "rgba(255,255,255,0.2)",
                "rgba(0,243,255,1)",
                "rgba(255,255,255,0.2)"
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}
