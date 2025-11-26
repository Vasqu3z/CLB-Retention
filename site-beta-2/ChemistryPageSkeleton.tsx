"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, Users, Sparkles, AlertTriangle } from "lucide-react";

/**
 * ChemistryPageSkeleton
 * 
 * Arcade-style loading state for Chemistry Network.
 * Design philosophy: Network nodes establishing connections, chemistry bonds forming.
 * Think: Neural network visualizing, relationship graph assembling.
 */
export default function ChemistryPageSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-comets-purple/10 blur-[120px] rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, 30, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-comets-cyan/10 blur-[100px] rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.12, 0.1],
            x: [0, -30, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-purple mb-4"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              opacity: { duration: 2, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
          >
            <Network size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Mapping Connections</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            >
              CHEMISTRY
            </motion.span>
            <br />
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
            >
              ANALYSIS
            </motion.span>
          </h1>

          <motion.div
            className="font-mono text-xs uppercase tracking-[0.5em] text-comets-purple"
            animate={{ 
              opacity: [0.3, 1, 0.3],
              textShadow: [
                "0 0 0px #BD00FF",
                "0 0 10px #BD00FF",
                "0 0 0px #BD00FF"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Building Network
          </motion.div>
        </motion.div>

        {/* Player selection skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-3 mb-12"
        >
          {[0, 1].map((idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + idx * 0.15, type: "spring" }}
              className="relative"
            >
              <div className="flex items-center gap-3 px-6 py-3 bg-surface-dark border-2 border-white/10 rounded-full">
                {/* Pulsing node */}
                <motion.div 
                  className="relative w-3 h-3 rounded-full bg-comets-purple/30"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                >
                  {/* Connection rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-comets-purple"
                    animate={{ 
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }}
                  />
                </motion.div>
                
                <motion.div 
                  className="w-24 h-4 bg-white/10 rounded relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-comets-purple/30 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.2 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="px-6 py-3 border-2 border-dashed border-white/10 rounded-full"
          >
            <motion.span 
              className="font-ui uppercase tracking-wider text-white/20 text-sm"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              + Add Player
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Team Chemistry Network skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="relative bg-surface-dark border border-white/10 rounded-lg p-8 overflow-hidden">
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

            <h2 className="font-display text-3xl uppercase text-white mb-6 flex items-center gap-3">
              <Users className="text-comets-cyan" size={32} />
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Team Chemistry Network
              </motion.span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Positive connections skeleton */}
              <ConnectionsSkeleton 
                title="Positive Connections" 
                icon={Sparkles}
                color="#F4D03F"
                delay={0.8}
                count={2}
              />

              {/* Negative connections skeleton */}
              <ConnectionsSkeleton 
                title="Conflicts" 
                icon={AlertTriangle}
                color="#FF4D4D"
                delay={1}
                count={1}
              />

            </div>

            {/* Network pulse effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-comets-purple/0 via-comets-purple/10 to-comets-purple/0 pointer-events-none"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* Individual player chemistry cards skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {[0, 1].map((playerIdx) => (
            <motion.div
              key={playerIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + playerIdx * 0.2, type: "spring", stiffness: 200 }}
              className="relative bg-surface-dark border border-white/10 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

              {/* Player header */}
              <div className="p-6 border-b border-white/10 bg-comets-purple/5">
                <motion.div 
                  className="h-6 bg-white/10 rounded w-32 mb-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: playerIdx * 0.3 }}
                  />
                </motion.div>
                <motion.div 
                  className="h-3 bg-white/5 rounded w-28 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: playerIdx * 0.3 + 0.2 }}
                  />
                </motion.div>
              </div>

              {/* Chemistry lists */}
              <div className="p-6 space-y-4">
                
                {/* Positive */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-comets-yellow" />
                    <motion.h4 
                      className="font-ui text-xs uppercase tracking-widest text-comets-yellow"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: playerIdx * 0.2 }}
                    >
                      Positive
                    </motion.h4>
                  </div>
                  <div className="space-y-1">
                    {[0, 1, 2].map((relIdx) => (
                      <ChemistryRelationshipSkeleton 
                        key={relIdx} 
                        delay={1.2 + playerIdx * 0.2 + relIdx * 0.1}
                        isPositive
                      />
                    ))}
                  </div>
                </div>

                {/* Negative */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-comets-red" />
                    <motion.h4 
                      className="font-ui text-xs uppercase tracking-widest text-comets-red"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: playerIdx * 0.2 + 0.3 }}
                    >
                      Negative
                    </motion.h4>
                  </div>
                  <div className="space-y-1">
                    {[0, 1].map((relIdx) => (
                      <ChemistryRelationshipSkeleton 
                        key={relIdx} 
                        delay={1.4 + playerIdx * 0.2 + relIdx * 0.1}
                        isPositive={false}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Node glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 0px rgba(189,0,255,0)",
                    "0 0 20px rgba(189,0,255,0.2)",
                    "0 0 0px rgba(189,0,255,0)"
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: playerIdx * 0.6 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center gap-2 mt-16"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [
                  "rgba(255,255,255,0.2)",
                  "rgba(189,0,255,1)",
                  "rgba(255,255,255,0.2)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

      </div>
    </main>
  );
}

// Connection section skeleton
function ConnectionsSkeleton({ 
  title, 
  icon: Icon, 
  color, 
  delay, 
  count 
}: { 
  title: string; 
  icon: any; 
  color: string; 
  delay: number; 
  count: number; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: title.includes("Positive") ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} style={{ color }} />
        <motion.h3 
          className="font-ui uppercase tracking-wider text-sm"
          style={{ color }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {title} ({count})
        </motion.h3>
      </div>
      
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 + idx * 0.1 }}
            className="p-3 rounded-lg border relative overflow-hidden"
            style={{ 
              backgroundColor: `${color}10`,
              borderColor: `${color}30`
            }}
          >
            {/* Connection line animation */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: color }}
              animate={{ 
                height: ["0%", "100%", "0%"],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
            />
            
            <div className="flex items-center gap-2 relative">
              <motion.div 
                className="h-4 bg-white/10 rounded w-20 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.3 }}
                />
              </motion.div>
              
              <motion.span 
                className="text-white/30 text-sm"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↔
              </motion.span>
              
              <motion.div 
                className="h-4 bg-white/10 rounded w-20 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: idx * 0.3 + 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Individual chemistry relationship skeleton
function ChemistryRelationshipSkeleton({ delay, isPositive }: { delay: number; isPositive: boolean }) {
  const bgColor = isPositive ? "bg-comets-yellow/10" : "bg-comets-red/10";
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center justify-between p-2 ${bgColor} rounded relative overflow-hidden`}
    >
      <motion.div 
        className="h-3 bg-white/10 rounded w-24 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay }}
        />
      </motion.div>
      
      <motion.div 
        className={`h-3 ${isPositive ? "bg-comets-yellow/30" : "bg-comets-red/30"} rounded w-12 overflow-hidden`}
      >
        <motion.div
          className={`h-full ${isPositive ? "bg-comets-yellow/50" : "bg-comets-red/50"}`}
          animate={{ width: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
        />
      </motion.div>
    </motion.div>
  );
}
