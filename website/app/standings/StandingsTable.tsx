"use client";

import React from "react";
import RetroTable from "@/components/ui/RetroTable";
import { cn } from "@/lib/utils";
import StatsTooltip from "@/components/ui/StatsTooltip";
import H2HTooltip from "@/components/ui/H2HTooltip";

// Data Interface
export interface TeamStanding {
  id: string;
  rank: number;
  teamName: string;
  teamCode: string;
  wins: number;
  losses: number;
  pct: string;
  gb: string;
  streak: string;
  runDiff: number;
  logoColor: string;
  h2hNote?: string; // Head-to-head record for tiebreaker context
}

interface StandingsTableProps {
  data: TeamStanding[];
}

export default function StandingsTable({ data }: StandingsTableProps) {

  const columns = [
    {
      header: "Rank",
      className: "w-16 text-center",
      cell: (item: TeamStanding) => (
        <span className={cn(
          "font-display text-lg",
          item.rank === 1 ? "text-comets-yellow drop-shadow-[0_0_5px_rgba(244,208,63,0.8)]" : "text-white/50"
        )}>
          {item.rank}
        </span>
      )
    },
    {
      header: "Team",
      className: "min-w-[200px]",
      cell: (item: TeamStanding) => {
        const teamDisplay = (
          <div className="flex items-center gap-3">
            {/* Logo Placeholder with Glow */}
            <div
              className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold border border-white/10 shadow-sm"
              style={{ color: item.logoColor, borderColor: item.rank === 1 ? item.logoColor : 'rgba(255,255,255,0.1)' }}
            >
              {item.teamCode[0]}
            </div>
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-wide text-white group-hover/row:text-comets-cyan transition-colors">
                {item.teamName}
              </span>
              <span className="text-[10px] text-white/40 md:hidden">{item.teamCode}</span>
            </div>
          </div>
        );

        // Wrap with H2H tooltip if head-to-head record exists
        if (item.h2hNote) {
          return (
            <H2HTooltip record={item.h2hNote} teamColor={item.logoColor}>
              {teamDisplay}
            </H2HTooltip>
          );
        }

        return teamDisplay;
      }
    },
    {
      header: <StatsTooltip stat="W" context="team">W</StatsTooltip>,
      accessorKey: "wins" as const,
      className: "text-center text-white/90"
    },
    {
      header: <StatsTooltip stat="L" context="team">L</StatsTooltip>,
      accessorKey: "losses" as const,
      className: "text-center text-white/60"
    },
    {
      header: <StatsTooltip stat="PCT" context="team">PCT</StatsTooltip>,
      accessorKey: "pct" as const,
      className: "text-center font-bold text-comets-blue tracking-wider"
    },
    {
      header: <StatsTooltip stat="GB" context="team">GB</StatsTooltip>,
      accessorKey: "gb" as const,
      className: "text-center text-white/40 hidden md:table-cell"
    },
    {
      header: <StatsTooltip stat="STRK" context="team">STRK</StatsTooltip>,
      className: "text-center",
      cell: (item: TeamStanding) => (
        <span className={cn(
          "px-2 py-1 rounded text-xs font-bold border",
          item.streak.startsWith("W")
            ? "bg-green-900/30 text-green-400 border-green-500/30 shadow-[0_0_5px_rgba(74,222,128,0.2)]"
            : "bg-red-900/30 text-red-400 border-red-500/30 shadow-[0_0_5px_rgba(248,113,113,0.2)]"
        )}>
          {item.streak}
        </span>
      )
    },
    {
      header: <StatsTooltip stat="DIFF" context="team">DIFF</StatsTooltip>,
      className: "text-center text-right hidden md:table-cell",
      cell: (item: TeamStanding) => (
        <span className={item.runDiff > 0 ? "text-green-400" : "text-red-400"}>
          {item.runDiff > 0 ? `+${item.runDiff}` : item.runDiff}
        </span>
      )
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
       <RetroTable
          data={data}
          columns={columns}
          onRowClick={(item) => console.log(`Clicked ${item.teamName}`)}
       />
    </div>
  );
}
