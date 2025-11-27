import React from "react";
import TeamSelectCard from "@/components/ui/TeamSelectCard";
import { Users } from "lucide-react";
import { getTeamRegistry, getStandings, getTeamData } from "@/lib/sheets";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function TeamsPage() {
  // Fetch team registry and standings data from Google Sheets
  const [teamRegistry, standings, teamStats] = await Promise.all([
    getTeamRegistry(),
    getStandings(false),
    getTeamData(undefined, false),
  ]);

  // Create a map of team names to their standings
  const standingsMap = new Map(
    standings.map(s => [s.team, s])
  );

  // Create a map of team names to their stats
  const statsMap = new Map(
    teamStats.map(s => [s.teamName, s])
  );

  // Transform team registry into the format expected by TeamSelectCard
  const teams = teamRegistry.map(team => {
    const standing = standingsMap.get(team.teamName);
    const stats = statsMap.get(team.teamName);

    // Calculate team batting average from team stats
    const avg = stats && stats.hitting.ab > 0
      ? (stats.hitting.h / stats.hitting.ab).toFixed(3)
      : ".000";

    return {
      name: team.teamName,
      code: team.abbr,
      logoColor: team.color,
      logoUrl: team.logoUrl, // Add logo URL from team registry
      stats: {
        wins: standing?.wins || 0,
        losses: standing?.losses || 0,
        avg: avg,
      },
      href: `/teams/${slugify(team.teamName)}`,
    };
  });

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 px-4 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-comets-blue/10 to-transparent -z-10" />
       
       <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-comets-cyan text-xs font-mono uppercase tracking-widest mb-4">
                  <Users size={14} />
                  League Roster
              </div>
              <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
                  Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Team</span>
              </h1>
          </div>

          {/* The Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team) => (
                  <TeamSelectCard key={team.code} {...team} />
              ))}
          </div>
       </div>
    </main>
  );
}