"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StatHighlight() {
  return (
    <section className="py-24 md:py-32 container mx-auto px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-[500px] bg-white/[0.02] -skew-y-3 -translate-y-1/2 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Text Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 text-comets-cyan mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp size={20} />
            </motion.div>
            <span className="font-ui font-bold tracking-widest uppercase text-sm">Deep Analytics</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-7xl text-white uppercase leading-[0.9] mb-8">
            Numbers <br/> don&apos;t lie.
          </h2>
          
          <p className="text-white/60 text-lg max-w-md mb-8 font-body leading-relaxed">
            Dive into advanced sabermetrics for the Mario Super Sluggers universe. Track OPS, Chemistry Ratios, and historical performance across all seasons using our custom-built engine.
          </p>
          
          <Link href="/tools/stats">
            <motion.button 
              className="group flex items-center gap-3 text-white border-b-2 border-comets-yellow pb-1 font-ui uppercase tracking-widest text-lg focus-arcade arcade-press"
              whileHover={{ x: 5 }}
            >
              Explore Data Tools
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Card Side */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            whileHover={{ 
              rotateY: 5, 
              scale: 1.02,
              boxShadow: "0 0 60px rgba(0,243,255,0.3)"
            }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring" }}
            className="relative z-10 bg-surface-dark/90 border border-white/10 p-6 md:p-8 rounded-xl backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                {/* Floating Avatar */}
                <motion.div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-display text-white shadow-lg"
                  style={{ 
                    background: "var(--comets-red)", 
                    boxShadow: "0 0 20px rgba(255,77,77,0.5)" 
                  }}
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 3, 0, -3, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.5 }
                  }}
                >
                  M
                </motion.div>
                <div>
                  <motion.div 
                    className="font-display text-2xl text-white"
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    MARIO
                  </motion.div>
                  <div className="font-ui text-comets-red text-sm tracking-widest uppercase">
                    Fireballs • Cpt
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-ui text-xs text-white/40 uppercase tracking-wider">Season AVG</div>
                <motion.div
                  className="font-mono text-4xl text-comets-yellow text-shadow-neon"
                  animate={{
                    textShadow: [
                      "0 0 10px var(--comets-yellow)",
                      "0 0 20px var(--comets-yellow)",
                      "0 0 10px var(--comets-yellow)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  .412
                </motion.div>
              </div>
            </div>
            
            {/* Stat Bars */}
            <div className="space-y-6">
              {[
                { label: "OPS", fullLabel: "On-base + Slugging", value: "1.240", width: "85%", color: "bg-comets-cyan", delay: 0 },
                { label: "HR", fullLabel: "Home Runs", value: "24", width: "65%", color: "bg-comets-red", delay: 0.2 },
                { label: "OBP", fullLabel: "On-Base Percentage", value: ".510", width: "55%", color: "bg-comets-purple", delay: 0.4 },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 relative overflow-hidden group/stat"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + stat.delay }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/stat:translate-x-full transition-transform duration-1000" />
                  
                  {/* Label with tooltip */}
                  <span className="font-ui text-white/60 text-sm uppercase tracking-wider w-16 z-10 relative group/tooltip cursor-help">
                    {stat.label}
                    <motion.span 
                      className="absolute left-0 bottom-full mb-2 px-3 py-1 bg-black/90 border rounded text-xs whitespace-nowrap pointer-events-none"
                      style={{ borderColor: stat.color.replace('bg-', 'var(--') + ')' }}
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      {stat.fullLabel}
                    </motion.span>
                  </span>
                  
                  {/* Bar */}
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.width }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.7 + stat.delay, 
                        duration: 1.5,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                      className={`h-full ${stat.color}`}
                      style={{ 
                        boxShadow: `0 0 15px currentColor`,
                        filter: "brightness(1.2)"
                      }}
                    />
                  </div>
                  
                  {/* Value */}
                  <motion.span 
                    className="font-mono text-white z-10"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.span>
                </motion.div>
              ))}
            </div>
            
            {/* Card Footer */}
            <motion.div 
              className="mt-6 text-center"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">
                Player Card // ID: 001
              </div>
            </motion.div>
          </motion.div>

          {/* Pulsing background glow */}
          <motion.div 
            className="absolute -inset-12 blur-3xl -z-10"
            style={{ 
              background: "linear-gradient(to top right, var(--comets-blue), var(--comets-purple))"
            }}
            animate={{ 
              opacity: [0.15, 0.3, 0.15],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Orbiting particles */}
          {[0, 120, 240].map((rotation, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-comets-cyan rounded-full blur-sm"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                rotate: rotation,
                x: [0, 150, 0],
                y: [0, 75, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
