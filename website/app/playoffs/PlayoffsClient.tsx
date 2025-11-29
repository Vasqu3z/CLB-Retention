"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Swords, Crown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamInfo {
  name: string;
  code: string;
  color: string;
  wins: number;
  emblem?: string;
  seed?: number;
}

interface Game {
  game: number;
  scoreA: number | null;
  scoreB: number | null;
  played: boolean;
}

interface Series {
  id: string;
  teamA: TeamInfo;
  teamB: TeamInfo;
  winner: string | null;
  games: Game[];
}

interface PlayoffsClientProps {
  semifinals: Series[];
  finals: Series | null;
}

export default function PlayoffsClient({ semifinals, finals }: PlayoffsClientProps) {
  return (
    <main className="min-h-screen pb-24 pt-28 px-4">
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-comets-yellow/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-comets-cyan/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 text-comets-yellow mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Trophy size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Season 2</span>
          </motion.div>

          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Star Cup
              <br />
              Playoffs
            </span>
          </h1>
        </motion.div>

        {/* Bracket */}
        {semifinals.length > 0 || finals ? (
          <div className="relative">
            {/* Bracket Layout with Connector Lines */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-0 items-center">
              {/* Left Column - Semifinals */}
              <div className="space-y-6 lg:pr-8">
                <h2 className="font-display text-2xl uppercase text-white mb-4 flex items-center gap-3">
                  <Swords className="text-comets-cyan" size={24} />
                  Semifinals
                </h2>
                {semifinals.slice(0, 1).map((series, idx) => (
                  <MatchupCard key={series.id} series={series} roundName="SF 1" delay={idx * 0.1} />
                ))}
                {/* Spacer for vertical alignment with connector */}
                <div className="hidden lg:block h-16" />
                {semifinals.slice(1, 2).map((series, idx) => (
                  <MatchupCard key={series.id} series={series} roundName="SF 2" delay={(idx + 1) * 0.1} />
                ))}
              </div>

              {/* Center Column - Connector Lines (desktop only) */}
              <div className="hidden lg:flex flex-col items-center justify-center py-8 relative">
                {/* SVG Connector Lines */}
                <svg
                  className="w-24 h-[400px]"
                  viewBox="0 0 96 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top connector - from SF1 to Finals */}
                  <motion.path
                    d="M0 80 H32 Q48 80 48 96 V184 Q48 200 64 200 H96"
                    stroke="url(#bracketGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                  {/* Bottom connector - from SF2 to Finals */}
                  <motion.path
                    d="M0 320 H32 Q48 320 48 304 V216 Q48 200 64 200 H96"
                    stroke="url(#bracketGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="bracketGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F3FF" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#00F3FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F4D03F" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Glow effect at center */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full bg-comets-yellow"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(244,208,63,0.5)',
                      '0 0 25px rgba(244,208,63,0.8)',
                      '0 0 10px rgba(244,208,63,0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Right Column - Finals */}
              <div className="lg:pl-8 flex items-center">
                {finals ? (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full"
                  >
                    <h2 className="font-display text-2xl uppercase text-white mb-4 flex items-center gap-3">
                      <Crown className="text-comets-yellow" size={24} />
                      Star Cup Finals
                    </h2>
                    <MatchupCard series={finals} roundName="Finals" isFinals />
                  </motion.div>
                ) : (
                  <div className="w-full bg-surface-dark/50 border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <Crown className="mx-auto mb-2 text-comets-yellow/30" size={32} />
                    <p className="font-mono text-xs text-white/30 uppercase tracking-wider">
                      Awaiting Semifinal Winners
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Connector Arrow (visible on small screens) */}
            <div className="lg:hidden flex justify-center my-6">
              <motion.div
                className="flex flex-col items-center text-comets-cyan/50"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className="w-0.5 h-8 bg-gradient-to-b from-comets-cyan/50 to-comets-yellow/50" />
                <ChevronDown size={20} />
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Trophy className="mx-auto mb-4 text-white/20" size={64} />
            <p className="text-white/40 font-mono uppercase text-sm">
              No playoff data available yet
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function MatchupCard({ series, roundName, delay = 0, isFinals = false }: { series: Series; roundName: string; delay?: number; isFinals?: boolean }) {
  const [showGames, setShowGames] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="relative group"
    >
      <div
        className={cn(
          "relative bg-surface-dark border-2 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer",
          isFinals
            ? "border-comets-yellow/30 hover:border-comets-yellow/70 shadow-[0_0_30px_rgba(244,208,63,0.15)]"
            : "border-white/10 hover:border-comets-cyan/50"
        )}
        onClick={() => setShowGames(!showGames)}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 scanlines opacity-5 pointer-events-none" />

        {/* Round badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">
          <Swords size={12} className="text-comets-red" />
          <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
            {roundName}
          </span>
        </div>

        {/* Team A */}
        <motion.div
          className={cn(
            "relative p-6 border-b border-white/10 transition-all",
            series.winner === series.teamA.name && "bg-comets-yellow/10 border-comets-yellow/30"
          )}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Seed badge */}
              {series.teamA.seed && series.teamA.seed > 0 && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="font-mono text-xs text-comets-cyan font-bold">
                    {series.teamA.seed}
                  </span>
                </div>
              )}
              {/* Team emblem */}
              <motion.div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl border-2 overflow-hidden"
                style={{
                  borderColor: series.teamA.color,
                  backgroundColor: `${series.teamA.color}20`,
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                {series.teamA.emblem ? (
                  <Image
                    src={series.teamA.emblem}
                    alt={series.teamA.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  series.teamA.code[0]
                )}
              </motion.div>
              <div>
                <div className="font-display text-xl uppercase text-white">{series.teamA.name}</div>
                <div className="font-mono text-xs text-white/40">{series.teamA.code}</div>
              </div>
            </div>
            {/* Series record */}
            <div
              className={cn(
                "font-mono font-bold text-4xl",
                series.winner === series.teamA.name ? "text-comets-yellow" : "text-white/60"
              )}
            >
              {series.teamA.wins}
            </div>
          </div>
          {series.winner === series.teamA.name && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Crown className="text-comets-yellow" size={24} />
            </div>
          )}
        </motion.div>

        {/* Team B */}
        <motion.div
          className={cn(
            "relative p-6 transition-all",
            series.winner === series.teamB.name && "bg-comets-yellow/10 border-comets-yellow/30"
          )}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Seed badge */}
              {series.teamB.seed && series.teamB.seed > 0 && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="font-mono text-xs text-comets-cyan font-bold">
                    {series.teamB.seed}
                  </span>
                </div>
              )}
              {/* Team emblem */}
              <motion.div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl border-2 overflow-hidden"
                style={{
                  borderColor: series.teamB.color,
                  backgroundColor: `${series.teamB.color}20`,
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                {series.teamB.emblem ? (
                  <Image
                    src={series.teamB.emblem}
                    alt={series.teamB.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  series.teamB.code[0]
                )}
              </motion.div>
              <div>
                <div className="font-display text-xl uppercase text-white">{series.teamB.name}</div>
                <div className="font-mono text-xs text-white/40">{series.teamB.code}</div>
              </div>
            </div>
            {/* Series record */}
            <div
              className={cn(
                "font-mono font-bold text-4xl",
                series.winner === series.teamB.name ? "text-comets-yellow" : "text-white/60"
              )}
            >
              {series.teamB.wins}
            </div>
          </div>
          {series.winner === series.teamB.name && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Crown className="text-comets-yellow" size={24} />
            </div>
          )}
        </motion.div>

        {/* Expand indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: showGames ? [0, -3, 0] : [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown
              className={cn("text-white/30 transition-transform", showGames && "rotate-180")}
              size={20}
            />
          </motion.div>
        </div>
      </div>

      {/* Game Details */}
      <AnimatePresence>
        {showGames && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-surface-dark border border-white/10 rounded-lg p-4 space-y-2">
              <div className="font-ui text-xs uppercase tracking-widest text-white/40 mb-3">
                Game Results
              </div>
              {series.games.map((game) => (
                <div
                  key={game.game}
                  className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-all"
                >
                  <span className="font-mono text-sm text-white/60">Game {game.game}</span>
                  {game.played ? (
                    <span className="font-mono text-white font-bold">
                      {game.scoreA} - {game.scoreB}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-white/30 uppercase">TBD</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
