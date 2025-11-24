"use client";

import React, { useMemo, useState } from "react";
import VersusCard from "@/components/ui/VersusCard";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScheduleGame } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";

interface ScheduleClientProps {
  schedule: ScheduleGame[];
}

interface MatchDisplay {
  id: string;
  home: { name: string; code: string; logoColor: string; score?: number };
  away: { name: string; code: string; logoColor: string; score?: number };
  date: string;
  time: string;
  isFinished: boolean;
}

function formatTeam(name: string, score?: number) {
  const team = getTeamByName(name);
  return {
    name,
    code: team?.shortName?.slice(0, 3).toUpperCase() ?? name.slice(0, 3).toUpperCase(),
    logoColor: team?.primaryColor ?? "var(--comets-cyan)",
    score,
  };
}

export function ScheduleClient({ schedule }: ScheduleClientProps) {
  const matchesByWeek = useMemo(() => {
    return schedule.reduce<Record<number, MatchDisplay[]>>((acc, game, index) => {
      const match: MatchDisplay = {
        id: `${game.week}-${index}`,
        home: formatTeam(game.homeTeam, game.homeScore),
        away: formatTeam(game.awayTeam, game.awayScore),
        date: `Week ${game.week}`,
        time: game.played ? "FINAL" : "Scheduled",
        isFinished: game.played,
      };
      if (!acc[game.week]) {
        acc[game.week] = [];
      }
      acc[game.week].push(match);
      return acc;
    }, {});
  }, [schedule]);

  const weeks = Object.keys(matchesByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  const [activeWeek, setActiveWeek] = useState(weeks[weeks.length - 1] ?? 1);
  const matches = matchesByWeek[activeWeek] ?? [];

  const matchesByDate = matches.reduce((acc, match) => {
    if (!acc[match.date]) {
      acc[match.date] = [];
    }
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, MatchDisplay[]>);

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4">
      <div className="container mx-auto max-w-4xl">
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

          <div className="flex gap-2">
            <motion.button
              onClick={() => setActiveWeek((prev) => Math.max(weeks[0] ?? 1, prev - 1))}
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
              onClick={() => setActiveWeek((prev) => Math.min(weeks[weeks.length - 1] ?? prev, prev + 1))}
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
        </div>

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
              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-white/40 text-sm">{date}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

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
