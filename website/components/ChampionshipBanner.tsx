"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, Star } from "lucide-react";
import Image from "next/image";
import Confetti from "./Confetti";

interface ChampionshipBannerProps {
  championName: string;
  championCode: string;
  championColor: string;
  championEmblem?: string;
  seasonNumber: number;
  showOnMount?: boolean; // Auto-show the celebration on mount
}

/**
 * ChampionshipBanner - Celebratory animation for the Star Cup Champion
 *
 * Shows an animated banner with confetti when a champion is crowned
 */
export default function ChampionshipBanner({
  championName,
  championCode,
  championColor,
  championEmblem,
  seasonNumber,
  showOnMount = true,
}: ChampionshipBannerProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (showOnMount && !hasShown) {
      // Small delay to let page render first
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setHasShown(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOnMount, hasShown]);

  return (
    <>
      <Confetti
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
        duration={6000}
        particleCount={150}
        colors={[championColor, '#F4D03F', '#FFFFFF', '#00F3FF']}
      />

      <motion.div
        className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-b from-surface-dark to-black"
        style={{ borderColor: championColor }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${championColor}30, transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Star particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-comets-yellow"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <Star size={12 + (i % 3) * 4} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 text-center">
          {/* Crown icon */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
          >
            <motion.div
              className="p-4 rounded-full bg-comets-yellow/20 border-2 border-comets-yellow"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(244,208,63,0.3)',
                  '0 0 40px rgba(244,208,63,0.6)',
                  '0 0 20px rgba(244,208,63,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="text-comets-yellow" size={48} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-ui text-sm uppercase tracking-[0.3em] text-comets-yellow mb-2">
              Season {seasonNumber} Champion
            </h2>
            <h3 className="font-display text-5xl md:text-7xl uppercase text-white mb-6">
              Star Cup
            </h3>
          </motion.div>

          {/* Champion Team */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          >
            {/* Team emblem */}
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 overflow-hidden flex items-center justify-center bg-white/5"
              style={{ borderColor: championColor }}
              animate={{
                boxShadow: [
                  `0 0 20px ${championColor}40`,
                  `0 0 40px ${championColor}70`,
                  `0 0 20px ${championColor}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {championEmblem ? (
                <Image
                  src={championEmblem}
                  alt={championName}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              ) : (
                <span
                  className="font-display text-5xl"
                  style={{ color: championColor }}
                >
                  {championCode}
                </span>
              )}
            </motion.div>

            {/* Team name */}
            <motion.h4
              className="font-display text-3xl md:text-4xl uppercase"
              style={{ color: championColor }}
              animate={{
                textShadow: [
                  `0 0 10px ${championColor}60`,
                  `0 0 20px ${championColor}90`,
                  `0 0 10px ${championColor}60`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {championName}
            </motion.h4>
          </motion.div>

          {/* Trophy icon */}
          <motion.div
            className="mt-8 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Trophy className="text-comets-yellow" size={24} />
            <span className="font-mono text-sm text-white/60 uppercase tracking-wider">
              Champions
            </span>
            <Trophy className="text-comets-yellow" size={24} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * MiniChampionBadge - Smaller inline badge for champion indication
 */
export function MiniChampionBadge({
  teamName,
  teamColor,
}: {
  teamName: string;
  teamColor: string;
}) {
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border"
      style={{
        backgroundColor: `${teamColor}20`,
        borderColor: `${teamColor}50`,
        color: teamColor,
      }}
      animate={{
        boxShadow: [
          `0 0 5px ${teamColor}30`,
          `0 0 10px ${teamColor}50`,
          `0 0 5px ${teamColor}30`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Crown size={12} />
      Champion
    </motion.span>
  );
}
