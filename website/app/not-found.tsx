"use client";

import { RetroButton } from "@/components/ui/RetroButton";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glitch lines */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-comets-red/20"
            style={{ top: `${i * 5}%` }}
            animate={{
              opacity: [0, 0.5, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-comets-cyan/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Giant Background Number with glitch effect */}
      <motion.div 
        className="font-display text-[8rem] md:text-[12rem] text-white/5 select-none leading-none absolute"
        animate={{
          opacity: [0.05, 0.1, 0.05],
          x: [0, 2, -2, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        404
      </motion.div>
      
      <div className="relative z-10 max-w-2xl">
        {/* Animated GAME OVER text */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
        >
          <motion.h1 
            className="font-display text-4xl md:text-6xl text-comets-red mb-4"
            animate={{
              textShadow: [
                "0 0 10px #FF4D4D",
                "0 0 20px #FF4D4D",
                "0 0 30px #FF4D4D",
                "0 0 20px #FF4D4D",
                "0 0 10px #FF4D4D",
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            GAME OVER
          </motion.h1>
        </motion.div>

        {/* Error message */}
        <motion.p 
          className="font-ui text-xl text-white/60 mb-2 tracking-widest uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Error 404: Page Not Found
        </motion.p>
        
        <motion.p 
          className="font-body text-base text-white/40 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          The page you are looking for is in another castle.
        </motion.p>
        
        {/* Action buttons */}
        <motion.div 
          className="flex flex-wrap gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <RetroButton variant="primary" size="md" href="/">
            <Home size={20} />
            Return Home
          </RetroButton>
          
          <RetroButton 
            variant="outline" 
            size="md" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
            Go Back
          </RetroButton>
        </motion.div>

        {/* Continue prompt */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-2"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-xs font-mono text-white/20 uppercase tracking-[0.3em]">
            Press any button to continue
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-comets-yellow/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Retro coin insert animation */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 1.5,
            type: "spring",
            stiffness: 100
          }}
        >
          <motion.div
            className="text-6xl"
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            🪙
          </motion.div>
        </motion.div>
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
    </div>
  );
}
