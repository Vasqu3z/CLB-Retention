"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock bracket data
const MOCK_BRACKET = {
  semifinals: [
    {
      id: "sf1",
      teamA: { name: "Mario Fireballs", code: "MAR", color: "#FF4D4D", wins: 3 },
      teamB: { name: "Luigi Knights", code: "LUI", color: "#2ECC71", wins: 1 },
      winner: "Mario Fireballs",
      games: [
        { game: 1, scoreA: 5, scoreB: 3 },
        { game: 2, scoreA: 2, scoreB: 8 },
        { game: 3, scoreA: 7, scoreB: 4 },
        { game: 4, scoreA: 6, scoreB: 2 },
      ]
    },
    {
      id: "sf2",
      teamA: { name: "Bowser Monsters", code: "BOW", color: "#F4D03F", wins: 3 },
      teamB: { name: "Peach Monarchs", code: "PCH", color: "#FF69B4", wins: 2 },
      winner: "Bowser Monsters",
      games: [
        { game: 1, scoreA: 4, scoreB: 5 },
        { game: 2, scoreA: 7, scoreB: 2 },
        { game: 3, scoreA: 3, scoreB: 6 },
        { game: 4, scoreA: 8, scoreB: 1 },
        { game: 5, scoreA: 5, scoreB: 3 },
      ]
    },
  ],
  finals: {
    id: "finals",
    teamA: { name: "Mario Fireballs", code: "MAR", color: "#FF4D4D", wins: 2 },
    teamB: { name: "Bowser Monsters", code: "BOW", color: "#F4D03F", wins: 1 },
    winner: null,
    games: [
      { game: 1, scoreA: 5, scoreB: 7 },
      { game: 2, scoreA: 9, scoreB: 3 },
      { game: 3, scoreA: 6, scoreB: 5 },
      { game: 4, scoreA: null, scoreB: null }, // Upcoming
    ]
  }
};

interface MatchupCardProps {
  series: any;
  roundName: string;
  delay?: number;
}

function MatchupCard({ series, roundName, delay = 0 }: MatchupCardProps) {
  const [showGames, setShowGames] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="relative group"
    >
      <div 
        className="relative bg-surface-dark border-2 border-white/10 rounded-lg overflow-hidden hover:border-comets-cyan/50 transition-all duration-300 cursor-pointer"
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
              {/* Team logo placeholder */}
              <motion.div 
                className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl border-2"
                style={{ 
                  borderColor: series.teamA.color,
                  backgroundColor: `${series.teamA.color}20`
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                {series.teamA.code}
              </motion.div>
              
              <div>
                <div className="font-ui text-white font-bold uppercase tracking-wider text-lg">
                  {series.teamA.name}
                </div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
                  SEED #1
                </div>
              </div>
            </div>

            {/* Wins display */}
            <motion.div 
              className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <span className="font-display text-3xl text-white font-bold">
                {series.teamA.wins}
              </span>
            </motion.div>
          </div>

          {series.winner === series.teamA.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2"
            >
              <Crown className="text-comets-yellow" size={20} fill="currentColor" />
            </motion.div>
          )}
        </motion.div>

        {/* Team B */}
        <motion.div 
          className={cn(
            "relative p-6 transition-all",
            series.winner === series.teamB.name && "bg-comets-yellow/10 border-t border-comets-yellow/30"
          )}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Team logo placeholder */}
              <motion.div 
                className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl border-2"
                style={{ 
                  borderColor: series.teamB.color,
                  backgroundColor: `${series.teamB.color}20`
                }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                {series.teamB.code}
              </motion.div>
              
              <div>
                <div className="font-ui text-white font-bold uppercase tracking-wider text-lg">
                  {series.teamB.name}
                </div>
                <div className="font-mono text-xs text-white/40 uppercase tracking-widest">
                  SEED #2
                </div>
              </div>
            </div>

            {/* Wins display */}
            <motion.div 
              className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <span className="font-display text-3xl text-white font-bold">
                {series.teamB.wins}
              </span>
            </motion.div>
          </div>

          {series.winner === series.teamB.name && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2"
            >
              <Crown className="text-comets-yellow" size={20} fill="currentColor" />
            </motion.div>
          )}
        </motion.div>

        {/* Game-by-game scores */}
        {showGames && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-black/30 p-4"
          >
            <div className="space-y-2">
              {series.games.map((game: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-2 bg-white/5 rounded"
                >
                  <span className="font-mono text-xs text-white/60 uppercase">
                    Game {game.game}
                  </span>
                  {game.scoreA !== null && game.scoreB !== null ? (
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className={cn(
                        "font-bold",
                        game.scoreA > game.scoreB ? "text-comets-yellow" : "text-white/40"
                      )}>
                        {game.scoreA}
                      </span>
                      <span className="text-white/20">-</span>
                      <span className={cn(
                        "font-bold",
                        game.scoreB > game.scoreA ? "text-comets-yellow" : "text-white/40"
                      )}>
                        {game.scoreB}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-comets-cyan uppercase">
                      Upcoming
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

export default function PlayoffsPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      
      {/* Cosmic background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-comets-red/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-comets-yellow/10 blur-[100px] rounded-full animate-pulse-slow" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <motion.div 
            className="inline-flex items-center gap-2 text-comets-red mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Trophy size={24} />
            <span className="font-ui uppercase tracking-[0.3em] text-sm">Championship Path</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-none tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              Playoff
              <br />
              Bracket
            </span>
          </h1>
        </motion.div>

        {/* Bracket structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Semifinals */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-comets-cyan/50" />
              <h2 className="font-display text-3xl uppercase text-white tracking-tight">
                Semifinals
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-comets-cyan/50" />
            </motion.div>

            {MOCK_BRACKET.semifinals.map((series, idx) => (
              <MatchupCard
                key={series.id}
                series={series}
                roundName="Semifinal"
                delay={0.2 + idx * 0.1}
              />
            ))}
          </div>

          {/* Finals */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-comets-yellow/50" />
              <h2 className="font-display text-3xl uppercase text-white tracking-tight">
                Finals
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-comets-yellow/50" />
            </motion.div>

            <MatchupCard
              series={MOCK_BRACKET.finals}
              roundName="Championship"
              delay={0.4}
            />

            {/* Champion display if finals complete */}
            {MOCK_BRACKET.finals.winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-8 bg-gradient-to-br from-comets-yellow/20 to-comets-red/20 border-2 border-comets-yellow/50 rounded-lg text-center"
              >
                <Trophy className="mx-auto mb-4 text-comets-yellow" size={48} />
                <div className="font-mono text-xs text-white/60 uppercase tracking-widest mb-2">
                  League Champion
                </div>
                <div className="font-display text-4xl text-comets-yellow uppercase">
                  {MOCK_BRACKET.finals.winner}
                </div>
              </motion.div>
            )}
          </div>

        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 p-6 bg-surface-dark border border-white/10 rounded-lg"
        >
          <div className="flex flex-wrap gap-6 justify-center font-mono text-xs text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-comets-yellow" />
              <span>Series Winner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-comets-yellow/20 border border-comets-yellow/50 rounded" />
              <span>Click for game details</span>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
