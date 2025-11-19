'use client';

import { StandingsRow, PlayerStats } from '@/lib/sheets';
import { Zap } from 'lucide-react';

interface LeagueStatsTickerProps {
  standings: StandingsRow[];
  allPlayers: PlayerStats[];
}

export default function LeagueStatsTicker({ standings, allPlayers }: LeagueStatsTickerProps) {
  // Calculate league-wide stats
  const totalGames = standings.reduce((sum, team) => sum + team.wins + team.losses, 0) / 2; // Divide by 2 since each game has 2 teams
  const totalRuns = standings.reduce((sum, team) => sum + team.runsScored, 0);
  const avgRunsPerGame = totalGames > 0 ? (totalRuns / totalGames).toFixed(1) : '0.0';

  // Get top batting average
  const topBatter = allPlayers.length > 0
    ? allPlayers
        .filter(p => p.avg)
        .reduce((prev, current) => {
          const prevAvg = parseFloat(prev.avg || '0');
          const currAvg = parseFloat(current.avg || '0');
          return currAvg > prevAvg ? current : prev;
        }, allPlayers[0])
    : null;

  // Get lowest ERA
  const topPitcher = allPlayers.length > 0
    ? allPlayers
        .filter(p => p.era && parseFloat(p.era) > 0)
        .reduce((prev, current) => {
          const prevEra = parseFloat(prev.era || '99.99');
          const currEra = parseFloat(current.era || '99.99');
          return currEra < prevEra ? current : prev;
        }, allPlayers.filter(p => p.era)[0])
    : null;

  // Get total home runs
  const totalHRs = allPlayers.reduce((sum, player) => sum + (player.hr || 0), 0);

  // Get most wins team
  const mostWinsTeam = standings.length > 0
    ? standings.reduce((prev, current) => current.wins > prev.wins ? current : prev)
    : null;

  const stats = [
    { label: 'Total Games Played', value: Math.floor(totalGames).toString() },
    { label: 'Avg Runs/Game', value: avgRunsPerGame },
    { label: 'Total Home Runs', value: totalHRs.toString() },
    topBatter && { label: 'Top BA', value: `${topBatter.name} ${topBatter.avg}` },
    topPitcher && { label: 'Best ERA', value: `${topPitcher.name} ${topPitcher.era}` },
    mostWinsTeam && { label: 'Most Wins', value: `${mostWinsTeam.team} (${mostWinsTeam.wins})` },
  ].filter(Boolean) as { label: string; value: string }[];

  // Duplicate stats for seamless loop
  const duplicatedStats = [...stats, ...stats];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-space-navy via-space-blue to-space-navy border-y-2 border-field-green/30 py-4">
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-space-navy/90 px-3 py-1.5 rounded-full border border-nebula-teal/50">
        <Zap className="w-4 h-4 text-nebula-teal animate-pulse" />
        <span className="text-xs font-display font-semibold text-nebula-teal uppercase tracking-wide">
          Live Stats
        </span>
      </div>

      {/* Scrolling content */}
      <div className="flex animate-scroll-ticker">
        {duplicatedStats.map((stat, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 mx-8 flex items-center gap-2"
            style={{ minWidth: '200px' }}
          >
            <span className="text-sm font-display font-semibold text-star-gray">
              {stat.label}:
            </span>
            <span className="text-sm font-display font-bold text-nebula-orange">
              {stat.value}
            </span>
            <span className="text-star-dim">•</span>
          </div>
        ))}
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-space-navy to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-space-navy to-transparent pointer-events-none z-10" />
    </div>
  );
}
