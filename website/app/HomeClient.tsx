"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HUDCorner } from "@/components/ui/HUDFrame";

// Team type for props
export interface TeamData {
  emblem: string;
  slug: string;
  name: string;
}

interface HomeClientProps {
  teams: TeamData[];
  season: number;
}

// Floating team emblem component - diagonal directions NW-SE or NE-SW
const TeamEmblem = ({ emblem, index }: { emblem: string; index: number }) => {
  // Randomize direction based on index: even = NE-SW, odd = NW-SE
  const isNEtoSW = index % 2 === 0;
  const delay = index * 2 + Math.random() * 2;
  const duration = 10 + Math.random() * 6;
  const size = 28 + (index % 3) * 10;

  // Starting positions
  const startX = isNEtoSW ? "110vw" : "-10vw";
  const endX = isNEtoSW ? "-10vw" : "110vw";
  const startY = 10 + (index * 12) % 50;
  const endY = startY + 40; // Move down as it crosses

  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
      }}
      initial={{ opacity: 0, x: startX, y: `${startY}%` }}
      animate={{
        opacity: [0, 0.5, 0.5, 0],
        x: [startX, "50vw", endX],
        y: [`${startY}%`, `${(startY + endY) / 2}%`, `${endY}%`],
        rotate: [0, isNEtoSW ? -15 : 15, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.1, 0.9, 1],
      }}
    >
      <Image
        src={emblem}
        alt="Team emblem"
        width={size}
        height={size}
        className="w-full h-full object-contain opacity-60"
      />
    </motion.div>
  );
};

// Comet trail component - streaks from E to W
const CometTrail = ({ index }: { index: number }) => {
  const startY = 15 + (index * 25);

  return (
    <motion.div
      className="absolute h-[2px] bg-gradient-to-l from-comets-orange via-comets-yellow/60 to-transparent rounded-full"
      style={{
        width: "150px",
        top: `${startY}%`,
        right: "-150px",
      }}
      initial={{ opacity: 0, x: 0 }}
      animate={{
        opacity: [0, 0.8, 0.8, 0],
        x: [0, -1500],
      }}
      transition={{
        duration: 3,
        delay: index * 4,
        repeat: Infinity,
        ease: "easeIn" as const,
        times: [0, 0.1, 0.9, 1],
      }}
    />
  );
};

export default function HomeClient({ teams, season }: HomeClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const glowPulse = {
    animate: {
      textShadow: [
        "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)",
        "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2)",
        "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)",
      ],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background Effects Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0, 243, 255, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(189, 0, 255, 0.06) 0%, transparent 40%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255, 107, 0, 0.06) 0%, transparent 40%)
            `,
          }}
        />

        {/* Floating team emblems */}
        <div className="absolute inset-0 overflow-hidden">
          {mounted && teams.map((team, i) => (
            <TeamEmblem key={team.slug} emblem={team.emblem} index={i} />
          ))}
        </div>

        {/* Comet trails */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {mounted && [0, 1, 2].map((i) => (
            <CometTrail key={i} index={i} />
          ))}
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-[0.03]" />
      </div>

      {/* HUD Corners - offset from top to avoid header overlap */}
      <div className="absolute inset-0 top-20 pointer-events-none">
        <HUDCorner position="tl" size="lg" color="comets-cyan" delay={0.5} />
        <HUDCorner position="tr" size="lg" color="comets-cyan" delay={0.6} />
        <HUDCorner position="bl" size="lg" color="comets-cyan" delay={0.7} />
        <HUDCorner position="br" size="lg" color="comets-cyan" delay={0.8} />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
      >
        {/* Season Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <motion.div
              className="w-2 h-2 rounded-full bg-comets-cyan"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(0,243,255,0)",
                  "0 0 10px rgba(0,243,255,0.8)",
                  "0 0 0px rgba(0,243,255,0)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-xs text-white/60 uppercase tracking-[0.3em]">
              Now Playing
            </span>
            <span className="font-ui text-sm text-comets-yellow font-semibold tracking-wider">
              SEASON {season}
            </span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div variants={itemVariants} className="relative mb-4">
          {/* Glow backdrop */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-comets-cyan/20 via-white/10 to-comets-purple/20 scale-150" />

          <motion.h1
            className="relative font-display text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] uppercase leading-[0.85] tracking-tight"
            {...glowPulse}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
              COMETS
            </span>
          </motion.h1>
        </motion.div>

        <motion.div variants={itemVariants} className="relative mb-4">
          <motion.h2
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/30"
            animate={{
              textShadow: [
                "0 0 10px rgba(0,243,255,0.3)",
                "0 0 20px rgba(0,243,255,0.5)",
                "0 0 10px rgba(0,243,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            LEAGUE
          </motion.h2>
        </motion.div>

        <motion.div variants={itemVariants} className="relative mb-6">
          <motion.h3
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-comets-yellow/90 to-comets-yellow/40"
            animate={{
              textShadow: [
                "0 0 8px rgba(244, 208, 63, 0.3)",
                "0 0 16px rgba(244, 208, 63, 0.5)",
                "0 0 8px rgba(244, 208, 63, 0.3)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            BASEBALL
          </motion.h3>
        </motion.div>

        {/* Star Icon */}
        <motion.div
          variants={itemVariants}
          className="relative mb-10"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <motion.div
              animate={{
                filter: [
                  "drop-shadow(0 0 10px rgba(244, 208, 63, 0.5)) drop-shadow(0 0 20px rgba(244, 208, 63, 0.3))",
                  "drop-shadow(0 0 20px rgba(244, 208, 63, 0.8)) drop-shadow(0 0 40px rgba(244, 208, 63, 0.5))",
                  "drop-shadow(0 0 10px rgba(244, 208, 63, 0.5)) drop-shadow(0 0 20px rgba(244, 208, 63, 0.3))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/icons/Star.png"
                alt="Star"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="font-ui text-lg md:text-xl text-comets-cyan/80 uppercase tracking-[0.25em] mb-16"
        >
          Mario Baseball Analytics
        </motion.p>

        {/* Team Emblems Bar - Clickable links to team pages */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-16 flex-wrap"
        >
          {teams.map((team, i) => (
            <Link key={team.slug} href={`/teams/${team.slug}`}>
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 relative cursor-pointer group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1, type: "spring" as const, stiffness: 300 }}
                whileHover={{
                  scale: 1.4,
                  filter: "drop-shadow(0 0 15px rgba(255,255,255,0.6))",
                }}
                whileTap={{ scale: 0.95 }}
                title={team.name}
              >
                <Image
                  src={team.emblem}
                  alt={team.name}
                  fill
                  className="object-contain transition-opacity group-hover:opacity-100 opacity-80"
                />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Press Start CTA */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          {/* Outer glow */}
          <motion.div
            className="absolute -inset-4 bg-comets-cyan/20 rounded-2xl blur-xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Button container with arcade styling */}
          <Link
            href="https://discord.gg/NWvm8Dd2s8"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block"
          >
            <motion.div
              className="relative px-12 py-6 bg-surface-dark border-2 border-comets-cyan/50 rounded-lg overflow-hidden group"
              whileHover={{ scale: 1.05, borderColor: "rgba(0, 243, 255, 0.8)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Scanlines inside button */}
              <div className="absolute inset-0 scanlines opacity-[0.05]" />

              {/* Coin slot decoration */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-comets-yellow/30 rounded-full" />

              {/* Inner glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-comets-cyan/10 to-transparent"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <div className="relative flex flex-col items-center gap-2">
                <motion.span
                  className="font-display text-2xl md:text-3xl text-white tracking-wider"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  PRESS START
                </motion.span>
                <span className="font-ui text-sm text-comets-cyan/80 uppercase tracking-[0.2em] group-hover:text-comets-cyan transition-colors">
                  Join Discord
                </span>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-comets-cyan/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-comets-cyan/50" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-comets-cyan/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-comets-cyan/50" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-16 text-white/20 font-mono text-xs uppercase tracking-widest"
        >
          Use sidebar to navigate
        </motion.div>
      </motion.div>

      {/* Decorative bottom bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-comets-cyan/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}
