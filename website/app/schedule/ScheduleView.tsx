"use client";

import React, { useState } from "react";
import VersusCard from "@/components/ui/VersusCard";
import { Calendar, ChevronLeft, ChevronRight, Grid3X3, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type Match = {
  id: string;
  home: { name: string; code: string; logoColor: string; logoUrl?: string; score?: number };
  away: { name: string; code: string; logoColor: string; logoUrl?: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
};

interface ScheduleViewProps {
  matchesByWeek: Record<number, Match[]>;
  weeks: number[];
  initialWeek: number;
}

type ViewMode = "week" | "all";

export default function ScheduleView({ matchesByWeek, weeks, initialWeek }: ScheduleViewProps) {
  const [activeWeek, setActiveWeek] = useState(initialWeek);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const matches = matchesByWeek[activeWeek] || [];

  // Group matches by date for week view
  const matchesByDate = matches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <main className="min-h-screen pb-24 pt-28 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-comets-red mb-2">
              <Calendar size={20} />
              <span className="font-ui uppercase tracking-widest text-sm">Official Schedule</span>
            </div>
            <h1 className="font-display text-5xl text-white uppercase leading-none">
              {viewMode === "week" ? `Week ${activeWeek}` : "Full Season"}
            </h1>
          </div>

          {/* View Toggle + Navigation */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "px-3 py-2 flex items-center gap-2 text-xs font-ui uppercase tracking-wider transition-colors",
                  viewMode === "week"
                    ? "bg-comets-cyan/20 text-comets-cyan"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <List size={14} />
                Week
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={cn(
                  "px-3 py-2 flex items-center gap-2 text-xs font-ui uppercase tracking-wider transition-colors",
                  viewMode === "all"
                    ? "bg-comets-cyan/20 text-comets-cyan"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Grid3X3 size={14} />
                All
              </button>
            </div>

            {/* Navigation Controls (only in week view) */}
            {viewMode === "week" && (
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveWeek(prev => Math.max(weeks[0], prev - 1))}
                  disabled={activeWeek === weeks[0]}
                  className={cn(
                    "w-10 h-10 rounded border flex items-center justify-center transition-colors focus-arcade",
                    activeWeek === weeks[0]
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
                  )}
                  whileHover={activeWeek !== weeks[0] ? { scale: 1.05 } : {}}
                  whileTap={activeWeek !== weeks[0] ? { scale: 0.95 } : {}}
                  aria-label="Previous week"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  onClick={() => setActiveWeek(prev => Math.min(weeks[weeks.length - 1], prev + 1))}
                  disabled={activeWeek === weeks[weeks.length - 1]}
                  className={cn(
                    "w-10 h-10 rounded border flex items-center justify-center transition-colors focus-arcade",
                    activeWeek === weeks[weeks.length - 1]
                      ? "border-white/5 text-white/20 cursor-not-allowed"
                      : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
                  )}
                  whileHover={activeWeek !== weeks[weeks.length - 1] ? { scale: 1.05 } : {}}
                  whileTap={activeWeek !== weeks[weeks.length - 1] ? { scale: 0.95 } : {}}
                  aria-label="Next week"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Week Selector Pills (only in week view) */}
        {viewMode === "week" && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            {weeks.map((week, index) => (
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
        )}

        <AnimatePresence mode="wait">
          {/* Week View */}
          {viewMode === "week" && (
            <motion.div
              key={`week-${activeWeek}`}
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
            </motion.div>
          )}

          {/* All Weeks View */}
          {viewMode === "all" && (
            <motion.div
              key="all-weeks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {weeks.map((week) => {
                const weekMatches = matchesByWeek[week] || [];
                if (weekMatches.length === 0) return null;

                return (
                  <div key={week} className="bg-surface-dark/50 rounded-xl border border-white/5 p-4">
                    {/* Week Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <h2 className="font-display text-xl text-white uppercase">Week {week}</h2>
                      <span className="font-mono text-xs text-white/40">
                        {weekMatches.length} {weekMatches.length === 1 ? "game" : "games"}
                      </span>
                    </div>

                    {/* Games Grid - 4 columns on xl, 3 on lg, 2 on md */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {weekMatches.map((match) => (
                        <VersusCard key={match.id} {...match} compact />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
