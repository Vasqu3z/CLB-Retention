"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";

interface InsertCoinProps {
  onInsert?: () => void;
  className?: string;
}

/**
 * InsertCoin - Classic arcade "INSERT COIN" blinking prompt
 *
 * Features a satisfying coin drop animation when clicked,
 * reminiscent of classic arcade cabinet prompts.
 */
export default function InsertCoin({ onInsert, className }: InsertCoinProps) {
  const [isInserting, setIsInserting] = useState(false);
  const [coinCount, setcoinCount] = useState(0);

  const handleInsert = useCallback(() => {
    if (isInserting) return;

    setIsInserting(true);
    setcoinCount((prev) => prev + 1);

    // Play coin sound effect if available
    // (sound effects are optional, so we just animate)

    setTimeout(() => {
      setIsInserting(false);
      onInsert?.();
    }, 1000);
  }, [isInserting, onInsert]);

  // Listen for keyboard input (any key to "insert coin")
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleInsert();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleInsert]);

  return (
    <motion.div
      className={`relative cursor-pointer select-none ${className}`}
      onClick={handleInsert}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Coin slot */}
      <div className="relative">
        {/* Slot frame */}
        <div className="relative inline-flex flex-col items-center p-6 border-2 border-comets-yellow/30 rounded-lg bg-black/50 backdrop-blur-sm overflow-hidden">
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

          {/* Coin slot graphic */}
          <div className="relative mb-4">
            <motion.div
              className="w-16 h-2 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-600 rounded-full border border-gray-500 shadow-inner"
              animate={isInserting ? {} : { opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Coin glow beneath slot */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-comets-yellow/30 blur-md rounded-full"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Falling coin animation */}
          <AnimatePresence>
            {isInserting && (
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2"
                initial={{ y: -40, rotate: 0, opacity: 1 }}
                animate={{ y: 60, rotate: 360, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeIn" }}
              >
                <div className="relative">
                  <Coins className="text-comets-yellow" size={24} />
                  {/* Sparkle trail */}
                  <motion.div
                    className="absolute inset-0 bg-comets-yellow/50 blur-md rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 0.2, repeat: 3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INSERT COIN text */}
          <motion.div
            className="font-display text-2xl md:text-3xl uppercase tracking-widest"
            animate={
              isInserting
                ? { color: "#F4D03F", scale: 1.1 }
                : { opacity: [0.5, 1, 0.5] }
            }
            transition={
              isInserting
                ? { duration: 0.2 }
                : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <span className="text-comets-yellow">INSERT</span>
            <span className="text-white mx-2">COIN</span>
          </motion.div>

          {/* Credit counter */}
          {coinCount > 0 && (
            <motion.div
              className="mt-3 font-mono text-xs text-comets-cyan uppercase tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Credits: {coinCount}
            </motion.div>
          )}

          {/* Instruction */}
          <motion.div
            className="mt-4 font-mono text-[10px] text-white/40 uppercase tracking-widest"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Click or press Enter
          </motion.div>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute -inset-2 bg-comets-yellow/10 blur-xl rounded-xl -z-10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

/**
 * InsertCoinPrompt - Full-screen overlay version
 * for initial page load or game start screens
 */
export function InsertCoinPrompt({
  onStart,
  title = "Ready Player One",
}: {
  onStart: () => void;
  title?: string;
}) {
  const [show, setShow] = useState(true);

  const handleInsert = () => {
    setTimeout(() => {
      setShow(false);
      onStart();
    }, 800);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            {/* Title */}
            <motion.h1
              className="font-display text-5xl md:text-7xl uppercase text-white mb-12"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>

            {/* Insert Coin prompt */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <InsertCoin onInsert={handleInsert} />
            </motion.div>

            {/* High Score hint */}
            <motion.div
              className="mt-12 font-mono text-xs text-white/30 uppercase tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ★ Top Sluggers Await ★
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ArcadeStartButton - Alternative styled start button
 */
export function ArcadeStartButton({
  children = "Start",
  onClick,
  className,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative px-8 py-4 font-display text-xl uppercase tracking-widest
        bg-gradient-to-b from-comets-red to-red-700 text-white
        border-4 border-red-400 rounded-lg
        shadow-[0_6px_0_0_#991b1b,0_8px_20px_rgba(255,77,77,0.4)]
        hover:shadow-[0_4px_0_0_#991b1b,0_6px_15px_rgba(255,77,77,0.5)]
        active:shadow-[0_2px_0_0_#991b1b,0_4px_10px_rgba(255,77,77,0.3)]
        active:translate-y-1
        transition-all duration-100
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Button shine */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded pointer-events-none" />
      {children}
    </motion.button>
  );
}
