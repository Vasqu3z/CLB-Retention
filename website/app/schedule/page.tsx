"use client";

import React, { useState } from "react";
import VersusCard from "@/components/ui/VersusCard";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TeamInfo = {
  name: string;
  code: string;
  logoColor: string;
  score?: number;
};

type ScheduleMatch = {
  id: string;
  home: TeamInfo;
  away: TeamInfo;
  date: string;
  time: string;
  isFinished: boolean;
};

// Mock Data - Replace with your Google Sheets fetch
const MATCHES_BY_WEEK: Record<number, ScheduleMatch[]> = {
  3: [
    {
      id: "w3-1",
      home: { name: "Yoshi Eggs", code: "YOS", logoColor: "#2E86DE", score: 7 },
      away: { name: "Wario Muscles", code: "WAR", logoColor: "#F1C40F", score: 2 },
      date: "MAY 05", time: "FINAL", isFinished: true 
    },
    { 
      id: "w3-2", 
      home: { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D", score: 8 }, 
      away: { name: "Peach Monarchs", code: "PCH", logoColor: "#FF69B4", score: 5 }, 
      date: "MAY 06", time: "FINAL", isFinished: true 
    },
  ],
  4: [
    {
      id: "w4-1",
      home: { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D", score: 5 },
      away: { name: "Bowser Monsters", code: "BOW", logoColor: "#F4D03F", score: 3 },
      date: "MAY 12", time: "FINAL", isFinished: true
    },
    {
      id: "w4-2",
      home: { name: "Luigi Knights", code: "LUI", logoColor: "#2ECC71", score: 1 },
      away: { name: "Wario Muscles", code: "WAR", logoColor: "#F1C40F", score: 4 },
      date: "MAY 12", time: "FINAL", isFinished: true
    },
    {
      id: "w4-3",
      home: { name: "Peach Monarchs", code: "PCH", logoColor: "#FF69B4" },
      away: { name: "Daisy Flowers", code: "DSY", logoColor: "#E67E22" },
      date: "MAY 14", time: "18:00 EST", isFinished: false
    },
    {
      id: "w4-4",
      home: { name: "Yoshi Eggs", code: "YOS", logoColor: "#2E86DE" },
      away: { name: "Birdo Bows", code: "BDO", logoColor: "#E91E63" },
      date: "MAY 14", time: "20:00 EST", isFinished: false
    },
  ],
  5: [
    {
      id: "w5-1",
      home: { name: "Bowser Monsters", code: "BOW", logoColor: "#F4D03F" },
      away: { name: "DK Wilds", code: "DKW", logoColor: "#8D6E63" },
      date: "MAY 19", time: "19:00 EST", isFinished: false
    },
    {
      id: "w5-2",
      home: { name: "Waluigi Spitballs", code: "WAL", logoColor: "#9B59B6" },
      away: { name: "Mario Fireballs", code: "MAR", logoColor: "#FF4D4D" },
      date: "MAY 20", time: "18:30 EST", isFinished: false
    },
  ]
};

const WEEKS = [3, 4, 5];

export default function SchedulePage() {
  const [activeWeek, setActiveWeek] = useState(4);
  const matches = MATCHES_BY_WEEK[activeWeek] || [];

  // Group matches by date
  const matchesByDate = matches.reduce<Record<string, ScheduleMatch[]>>((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-comets-red mb-2">
              <Calendar size={20} />
              <span className="font-ui uppercase tracking-widest text-sm">Official Schedule</span>
            </div>
            <h1 className="font-display text-5xl text-white uppercase leading-none">
              Week {activeWeek}
            </h1>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex gap-2">
            <motion.button 
              onClick={() => setActiveWeek(prev => Math.max(WEEKS[0], prev - 1))}
              disabled={activeWeek === WEEKS[0]}
              className={cn(
                "w-10 h-10 rounded border flex items-center justify-center transition-colors focus-arcade",
                activeWeek === WEEKS[0]
                  ? "border-white/5 text-white/20 cursor-not-allowed"
                  : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
              )}
              whileHover={activeWeek !== WEEKS[0] ? { scale: 1.05 } : {}}
              whileTap={activeWeek !== WEEKS[0] ? { scale: 0.95 } : {}}
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button 
              onClick={() => setActiveWeek(prev => Math.min(WEEKS[WEEKS.length - 1], prev + 1))}
              disabled={activeWeek === WEEKS[WEEKS.length - 1]}
              className={cn(
                "w-10 h-10 rounded border flex items-center justify-center transition-colors focus-arcade",
                activeWeek === WEEKS[WEEKS.length - 1]
                  ? "border-white/5 text-white/20 cursor-not-allowed"
                  : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
              )}
              whileHover={activeWeek !== WEEKS[WEEKS.length - 1] ? { scale: 1.05 } : {}}
              whileTap={activeWeek !== WEEKS[WEEKS.length - 1] ? { scale: 0.95 } : {}}
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* ENHANCED: Week Selector Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {WEEKS.map((week, index) => (
            <motion.button
              key={week}
              onClick={() => setActiveWeek(week)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative px-6 py-2 rounded-full font-ui uppercase tracking-widest text-sm transition-all whitespace-nowrap focus-arcade",
                activeWeek === week
                  ? "text-black"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeWeek === week && (
                <motion.div
                  layoutId="activeWeek"
                  className="absolute inset-0 bg-comets-yellow rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Week {week}</span>
            </motion.button>
          ))}
        </div>

        {/* Timeline with animated transitions */}
        <motion.div 
          key={activeWeek}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {Object.entries(matchesByDate).map(([date, dateMatches]) => (
            <div key={date}>
              {/* Day Group Header */}
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-white/40 text-sm">{date}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Matches for this date */}
              <div className="space-y-4">
                {dateMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VersusCard {...match} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Empty state */}
        {matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4 opacity-20">📅</div>
            <div className="font-display text-2xl text-white/40 mb-2">No Games Scheduled</div>
            <div className="font-ui text-sm text-white/20 uppercase tracking-widest">
              Check back soon for updates
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
