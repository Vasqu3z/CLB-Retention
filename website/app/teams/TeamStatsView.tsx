"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TeamData, StandingsRow } from "@/lib/sheets";
import RetroTabs from "@/components/ui/RetroTabs";
import RetroTable from "@/components/ui/RetroTable";
import { cn } from "@/lib/utils";
import { Crosshair, Target, Shield } from "lucide-react";

type Tab = "hitting" | "pitching" | "fielding";

interface TeamStatsViewProps {
  regularTeamData: TeamData[];
  regularStandings: StandingsRow[];
  playoffTeamData: TeamData[];
  playoffStandings: StandingsRow[];
  teamRegistry: Array<{
    teamName: string;
    abbr: string;
    color: string;
    emblemUrl?: string;
    status?: string;
  }>;
}

interface EnhancedTeam extends TeamData {
  id: string;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  era: string;
  whip: string;
  baa: string;
  rGame: string;
  oaa: number;
  der: string;
  color: string;
  slug: string;
  emblemUrl?: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function TeamStatsView({
  regularTeamData,
  regularStandings,
  playoffTeamData,
  playoffStandings,
  teamRegistry,
}: TeamStatsViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("hitting");

  // Use appropriate data based on toggle
  const teamData = isPlayoffs ? playoffTeamData : regularTeamData;
  const standings = isPlayoffs ? playoffStandings : regularStandings;

  // Create team lookup map
  const teamMap = new Map(teamRegistry.map((t) => [t.teamName, t]));

  // Get active team names
  const activeTeamNames = teamRegistry
    .filter((t) => t.status?.toLowerCase() === "active")
    .map((t) => t.teamName);

  // Calculate derived stats
  const enhancedTeamData: EnhancedTeam[] = teamData
    .filter((team) => activeTeamNames.includes(team.teamName))
    .map((team) => {
      const standingsEntry = standings.find((s) => s.team === team.teamName);
      const runsScored = standingsEntry?.runsScored || team.hitting.rbi;
      const teamInfo = teamMap.get(team.teamName);

      // Calculate rate stats
      const avg =
        team.hitting.ab > 0
          ? (team.hitting.h / team.hitting.ab).toFixed(3).substring(1)
          : ".000";

      const obpValue =
        team.hitting.ab + team.hitting.bb > 0
          ? (team.hitting.h + team.hitting.bb) /
            (team.hitting.ab + team.hitting.bb)
          : 0;
      const obp =
        obpValue >= 1
          ? obpValue.toFixed(3)
          : obpValue > 0
            ? obpValue.toFixed(3).substring(1)
            : ".000";

      const slgValue =
        team.hitting.ab > 0 ? team.hitting.tb / team.hitting.ab : 0;
      const slg =
        slgValue >= 1
          ? slgValue.toFixed(3)
          : slgValue > 0
            ? slgValue.toFixed(3).substring(1)
            : ".000";

      const ops =
        team.hitting.ab > 0 && team.hitting.ab + team.hitting.bb > 0
          ? (
              (team.hitting.h + team.hitting.bb) /
                (team.hitting.ab + team.hitting.bb) +
              team.hitting.tb / team.hitting.ab
            ).toFixed(3)
          : "0.000";

      const era =
        team.pitching.ip > 0
          ? ((team.pitching.r * 9) / team.pitching.ip).toFixed(2)
          : "0.00";
      const whip =
        team.pitching.ip > 0
          ? (
              (team.pitching.h + team.pitching.bb) /
              team.pitching.ip
            ).toFixed(2)
          : "0.00";
      const baa =
        team.pitching.bf > 0
          ? (team.pitching.h / team.pitching.bf).toFixed(3).substring(1)
          : ".000";

      const rGame = team.gp > 0 ? (runsScored / team.gp).toFixed(2) : "0.00";
      const oaa = team.fielding.np - team.fielding.e;
      const der = team.gp > 0 ? (oaa / team.gp).toFixed(2) : "0.00";

      return {
        ...team,
        id: team.teamName,
        avg,
        obp,
        slg,
        ops,
        era,
        whip,
        baa,
        rGame,
        oaa,
        der,
        color: teamInfo?.color || "#FFFFFF",
        slug: slugify(team.teamName),
        emblemUrl: teamInfo?.emblemUrl,
      };
    });

  // Tab config - consistent colors across site
  // Hitting: cyan, Pitching: yellow, Fielding: purple
  const tabs = [
    { value: "hitting", label: "Hitting", icon: Crosshair, color: "cyan" as const },
    { value: "pitching", label: "Pitching", icon: Target, color: "yellow" as const },
    { value: "fielding", label: "Fielding", icon: Shield, color: "purple" as const },
  ];

  // Team name cell renderer
  const TeamCell = (team: EnhancedTeam) => (
    <Link
      href={`/teams/${team.slug}`}
      className="flex items-center gap-2 hover:text-comets-cyan transition-colors group"
    >
      {team.emblemUrl && (
        <div className="w-5 h-5 relative flex-shrink-0">
          <Image
            src={team.emblemUrl}
            alt={team.teamName}
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      )}
      <span
        className="font-ui font-bold uppercase tracking-wider group-hover:underline"
        style={{ color: team.color }}
      >
        {team.teamName}
      </span>
    </Link>
  );

  // Hitting columns
  const hittingColumns = [
    { header: "Team", cell: TeamCell, className: "text-left" },
    { header: "GP", accessorKey: "gp" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-white/50" },
    { header: "R/G", accessorKey: "rGame" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-cyan font-bold" },
    { header: "AB", cell: (t: EnhancedTeam) => t.hitting.ab, className: "text-center font-mono", condensed: true },
    { header: "H", cell: (t: EnhancedTeam) => t.hitting.h, className: "text-center font-mono", condensed: true },
    { header: "HR", cell: (t: EnhancedTeam) => t.hitting.hr, className: "text-center font-mono" },
    { header: "RBI", cell: (t: EnhancedTeam) => t.hitting.rbi, className: "text-center font-mono" },
    { header: "AVG", accessorKey: "avg" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow" },
    { header: "OBP", accessorKey: "obp" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow", condensed: true },
    { header: "SLG", accessorKey: "slg" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow" },
    { header: "OPS", accessorKey: "ops" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow" },
  ];

  // Pitching columns
  const pitchingColumns = [
    { header: "Team", cell: TeamCell, className: "text-left" },
    { header: "GP", accessorKey: "gp" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-white/50" },
    { header: "ERA", accessorKey: "era" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-cyan font-bold" },
    { header: "IP", cell: (t: EnhancedTeam) => t.pitching.ip.toFixed(1), className: "text-center font-mono" },
    { header: "W", accessorKey: "wins" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono", condensed: true },
    { header: "L", accessorKey: "losses" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono", condensed: true },
    { header: "SV", cell: (t: EnhancedTeam) => t.pitching.sv, className: "text-center font-mono", condensed: true },
    { header: "H", cell: (t: EnhancedTeam) => t.pitching.h, className: "text-center font-mono" },
    { header: "HR", cell: (t: EnhancedTeam) => t.pitching.hr, className: "text-center font-mono" },
    { header: "WHIP", accessorKey: "whip" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow" },
    { header: "BAA", accessorKey: "baa" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-comets-yellow" },
  ];

  // Fielding columns
  const fieldingColumns = [
    { header: "Team", cell: TeamCell, className: "text-left" },
    { header: "GP", accessorKey: "gp" as keyof EnhancedTeam, sortable: true, className: "text-center font-mono text-white/50" },
    {
      header: "DER",
      accessorKey: "der" as keyof EnhancedTeam,
      sortable: true,
      className: "text-center font-mono text-comets-cyan font-bold",
      cell: (t: EnhancedTeam) => `${parseFloat(t.der) > 0 ? "+" : ""}${t.der}`,
    },
    { header: "NP", cell: (t: EnhancedTeam) => t.fielding.np, className: "text-center font-mono" },
    { header: "E", cell: (t: EnhancedTeam) => t.fielding.e, className: "text-center font-mono" },
    {
      header: "OAA",
      accessorKey: "oaa" as keyof EnhancedTeam,
      sortable: true,
      className: "text-center font-mono text-comets-yellow",
      cell: (t: EnhancedTeam) => `${t.oaa > 0 ? "+" : ""}${t.oaa}`,
    },
    { header: "SB", cell: (t: EnhancedTeam) => t.fielding.sb, className: "text-center font-mono" },
    { header: "CS", cell: (t: EnhancedTeam) => t.fielding.cs, className: "text-center font-mono" },
  ];

  const currentColumns =
    activeTab === "hitting"
      ? hittingColumns
      : activeTab === "pitching"
        ? pitchingColumns
        : fieldingColumns;

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Stat Type Tabs */}
        <RetroTabs
          tabs={tabs}
          value={activeTab}
          onChange={(v) => setActiveTab(v as Tab)}
        />

        {/* Season Toggle */}
        <div className="flex items-center gap-2 bg-surface-dark border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setIsPlayoffs(false)}
            className={cn(
              "px-4 py-2 rounded-md font-ui text-xs uppercase tracking-wider transition-all",
              !isPlayoffs
                ? "bg-comets-cyan text-black"
                : "text-white/50 hover:text-white"
            )}
          >
            Regular
          </button>
          <button
            onClick={() => setIsPlayoffs(true)}
            className={cn(
              "px-4 py-2 rounded-md font-ui text-xs uppercase tracking-wider transition-all",
              isPlayoffs
                ? "bg-comets-yellow text-black"
                : "text-white/50 hover:text-white"
            )}
          >
            Playoffs
          </button>
        </div>
      </div>

      {/* Data Table */}
      <motion.div
        key={`${activeTab}-${isPlayoffs}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <RetroTable
          data={enhancedTeamData}
          columns={currentColumns}
        />
      </motion.div>

      {/* Empty State */}
      {enhancedTeamData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4 opacity-20">📊</div>
          <div className="font-display text-xl text-white/40">
            No {isPlayoffs ? "playoff" : "regular season"} data available
          </div>
        </div>
      )}
    </div>
  );
}
