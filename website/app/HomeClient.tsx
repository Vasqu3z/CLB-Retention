"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Calendar, Users, Activity, Star } from "lucide-react";
import StatHighlight from "@/components/ui/StatHighlight";
import RetroCard from "@/components/ui/RetroCard";
import { RetroButton } from "@/components/ui/RetroButton";

interface HomeClientProps {
  tickerItems: string[];
}

// HUD corner bracket component for diegetic framing
const HUDCorner = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
      className={`absolute w-8 h-8 md:w-12 md:h-12 pointer-events-none
        ${isTop ? "top-4 md:top-8" : "bottom-4 md:bottom-8"}
        ${isLeft ? "left-4 md:left-8" : "right-4 md:right-8"}
      `}
    >
      <div
        className={`absolute w-full h-[2px] bg-gradient-to-${isLeft ? "r" : "l"} from-comets-cyan to-transparent
          ${isTop ? "top-0" : "bottom-0"}
        `}
      />
      <div
        className={`absolute h-full w-[2px] bg-gradient-to-${isTop ? "b" : "t"} from-comets-cyan to-transparent
          ${isLeft ? "left-0" : "right-0"}
        `}
      />
    </motion.div>
  );
};

const HeroSection = () => {
  // Staggered animation variants for arcade menu feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-comets-blue/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-comets-purple/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      {/* Scanlines overlay for diegetic arcade feel */}
      <div className="absolute inset-0 scanlines opacity-[0.04] pointer-events-none z-10" />

      {/* HUD Frame corners */}
      <HUDCorner position="tl" />
      <HUDCorner position="tr" />
      <HUDCorner position="bl" />
      <HUDCorner position="br" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 container mx-auto px-4 flex flex-col items-center text-center"
      >
        <motion.div variants={itemVariants} className="relative">
          <h1 className="font-display text-6xl md:text-[9rem] uppercase leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Comets
            <br />
            <span className="md:ml-24 block">League</span>
          </h1>

          {/* Star with power-up glow effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring", bounce: 0.4 }}
            className="absolute -top-8 -right-4 md:-top-12 md:-right-16 text-comets-yellow group"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(244, 208, 63, 0.3)",
                  "0 0 40px rgba(244, 208, 63, 0.6)",
                  "0 0 20px rgba(244, 208, 63, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full"
            >
              <Star size={64} fill="currentColor" className="animate-spin-slow drop-shadow-[0_0_15px_rgba(244,208,63,0.8)]" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-8 text-xl md:text-2xl font-ui text-comets-cyan uppercase tracking-widest max-w-2xl"
        >
          The Premier Mario Baseball Statistics Hub
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap gap-4 justify-center"
        >
          <RetroButton variant="primary" size="lg" href="/standings">
            View Standings
          </RetroButton>
          <RetroButton variant="outline" size="lg" href="/schedule">
            Latest Scores
          </RetroButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to Start</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
};

const LiveTicker = ({ items }: { items: string[] }) => {
  return (
    <div className="w-full bg-comets-yellow text-black py-3 overflow-hidden flex relative z-20 border-y-4 border-black transform -skew-y-1 mb-24">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-comets-yellow to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-comets-yellow to-transparent z-10" />

      <motion.div
        className="flex gap-16 whitespace-nowrap font-ui font-bold text-lg uppercase tracking-wider items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="w-2 h-2 bg-black rounded-full" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default function HomeClient({ tickerItems }: HomeClientProps) {
  const features = [
    {
      title: "League Standings",
      subtitle: "Track team performance and playoff races.",
      icon: Trophy,
      href: "/standings",
      color: "#F4D03F",
    },
    {
      title: "Player Stats",
      subtitle: "Comprehensive database of every slugger.",
      icon: Users,
      href: "/players",
      color: "#00F3FF",
    },
    {
      title: "Full Schedule",
      subtitle: "Upcoming matches and historical results.",
      icon: Calendar,
      href: "/schedule",
      color: "#FF4D4D",
    },
    {
      title: "Lineup Builder",
      subtitle: "Optimize your team chemistry and stats.",
      icon: Activity,
      href: "/tools/lineup",
      color: "#BD00FF",
    },
  ];

  return (
    <main className="text-foreground overflow-x-hidden selection:bg-comets-cyan selection:text-black">
      <HeroSection />
      <LiveTicker items={tickerItems} />

      <div className="container mx-auto px-4 py-24 relative z-20">
        {/* Section header with diegetic styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-xs font-ui text-white/40 uppercase tracking-[0.3em]">Main Menu</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring" as const,
                    stiffness: 300,
                    damping: 25,
                  },
                },
              }}
            >
              <RetroCard {...feature} delay={0} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <StatHighlight />

      {/* PRESS START style CTA */}
      <div className="py-24 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[200px] bg-comets-cyan/5 blur-[100px] rounded-full" />
        </div>
        <Link href="/signup" className="inline-block group relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative"
          >
            {/* Pulsing glow background */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-comets-cyan/20 blur-xl rounded-lg -z-10"
            />

            {/* Main text with arcade styling */}
            <div className="relative px-8 py-4 border border-comets-cyan/30 rounded-lg overflow-hidden">
              {/* Scanlines */}
              <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

              {/* HUD corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-comets-cyan" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-comets-cyan" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-comets-cyan" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-comets-cyan" />

              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="font-display text-3xl md:text-5xl text-comets-cyan uppercase tracking-[0.2em] select-none group-hover:text-white transition-colors duration-300"
              >
                Press Start
              </motion.div>

              <div className="mt-2 text-xs font-ui text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">
                Join The League
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </main>
  );
}
