'use client';

import { useState } from 'react';
import { ScheduleGame } from '@/lib/sheets';
import { Team } from '@/config/league';

interface ScheduleViewProps {
  schedule: ScheduleGame[];
  teams: Team[];
}

export default function ScheduleView({ schedule, teams }: ScheduleViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Group games by week
  const gamesByWeek = schedule.reduce((acc, game) => {
    const weekKey = `Week ${game.week}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(game);
    return acc;
  }, {} as Record<string, ScheduleGame[]>);

  // Sort weeks numerically
  const weekKeys = Object.keys(gamesByWeek).sort((a, b) => {
    const weekA = parseInt(a.replace('Week ', ''));
    const weekB = parseInt(b.replace('Week ', ''));
    return weekA - weekB;
  });

  // Filter games by selected team
  const filterGame = (game: ScheduleGame): boolean => {
    if (selectedTeam === 'all') return true;
    return game.homeTeam === selectedTeam || game.awayTeam === selectedTeam;
  };

  return (
    <div className="space-y-6">
      {/* Team Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="team-filter" className="text-sm font-display font-semibold text-star-white">
            Filter by Team:
          </label>
          <select
            id="team-filter"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 font-mono"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.slug} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-12">
        {weekKeys.map((weekKey) => {
          const weekGames = gamesByWeek[weekKey].filter(filterGame);

          if (weekGames.length === 0) return null;

          return (
            <div key={weekKey} className="glass-card p-6">
              {/* Week Header */}
              <div className="mb-6 pb-3 border-b border-star-gray/20">
                <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-nebula-cyan to-star-pink bg-clip-text text-transparent">
                  {weekKey}
                </h2>
              </div>

              {/* Game Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weekGames.map((game, idx) => (
                  <GameCard key={`${weekKey}-${idx}`} game={game} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="glass-card p-6">
        <p className="font-display font-semibold text-nebula-orange mb-3 text-sm uppercase tracking-wider">
          How to Read the Schedule
        </p>
        <ul className="space-y-1.5 text-sm font-mono text-star-gray">
          <li>• Cyan highlight indicates the winning team</li>
          <li>• Click a game card to view the full box score</li>
          <li>• Italic text shows upcoming games</li>
        </ul>
      </div>
    </div>
  );
}

function GameCard({ game }: { game: ScheduleGame }) {
  if (!game.played) {
    // Upcoming game
    return (
      <div className="glass-card p-0 overflow-hidden hover:border-nebula-cyan/50 transition-all duration-300">
        <div className="bg-space-blue/30 backdrop-blur-sm px-4 py-2 border-b border-cosmic-border">
          <span className="text-xs font-display font-semibold text-star-gray uppercase tracking-wider">Upcoming Game</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-space-blue/20 backdrop-blur-sm">
            <span className="font-semibold text-star-gray italic font-mono text-sm">{game.awayTeam}</span>
            <span className="text-xs text-star-gray/50">@</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-space-blue/20 backdrop-blur-sm">
            <span className="font-semibold text-star-gray italic font-mono text-sm">{game.homeTeam}</span>
          </div>
        </div>
      </div>
    );
  }

  // Completed game
  const homeWon = game.winner === game.homeTeam;
  const awayWon = game.winner === game.awayTeam;

  const content = (
    <div className="bg-space-black/30 border border-star-gray/30 rounded-lg overflow-hidden hover:border-nebula-cyan/50 hover:scale-[1.02] transition-all duration-300 group">
      <div className="bg-space-black/50 px-4 py-2 border-b border-star-gray/20">
        <div className="flex justify-between items-center">
          <span className="text-xs font-display font-semibold text-solar-gold uppercase tracking-wider">Final</span>
          {game.boxScoreUrl && (
            <span className="text-xs text-nebula-cyan group-hover:text-nebula-teal transition-colors">
              View Box Score →
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            awayWon
              ? 'bg-nebula-cyan/20 border-2 border-nebula-cyan/50'
              : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
          }`}
        >
          <span className={`font-semibold font-mono text-sm ${
            awayWon ? 'text-nebula-cyan' : 'text-star-white'
          }`}>
            {game.awayTeam}
          </span>
          <span className={`text-xl font-bold font-mono ${
            awayWon ? 'text-nebula-cyan' : 'text-star-gray'
          }`}>
            {game.awayScore}
          </span>
        </div>

        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            homeWon
              ? 'bg-nebula-cyan/20 border-2 border-nebula-cyan/50'
              : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
          }`}
        >
          <span className={`font-semibold font-mono text-sm ${
            homeWon ? 'text-nebula-cyan' : 'text-star-white'
          }`}>
            {game.homeTeam}
          </span>
          <span className={`text-xl font-bold font-mono ${
            homeWon ? 'text-nebula-cyan' : 'text-star-gray'
          }`}>
            {game.homeScore}
          </span>
        </div>

        {/* Game Details */}
        {(game.mvp || game.winningPitcher || game.losingPitcher || game.savePitcher) && (
          <div className="mt-3 pt-3 border-t border-star-gray/20">
            <p className="text-xs font-display font-semibold text-star-gray uppercase tracking-wider mb-2">
              Game Details
            </p>
            <div className="space-y-1.5 text-sm font-mono">
              {game.mvp && (
                <div className="flex justify-between">
                  <span className="text-nebula-orange font-bold">MVP:</span>
                  <span className="text-star-white">{game.mvp}</span>
                </div>
              )}
              {game.winningPitcher && (
                <div className="flex justify-between">
                  <span className="text-nebula-teal font-bold">W:</span>
                  <span className="text-star-white">{game.winningPitcher}</span>
                </div>
              )}
              {game.losingPitcher && (
                <div className="flex justify-between">
                  <span className="text-nebula-coral font-bold">L:</span>
                  <span className="text-star-white">{game.losingPitcher}</span>
                </div>
              )}
              {game.savePitcher && (
                <div className="flex justify-between">
                  <span className="text-solar-gold font-bold">SV:</span>
                  <span className="text-star-white">{game.savePitcher}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If box score URL exists, make card clickable
  if (game.boxScoreUrl) {
    return (
      <a
        href={game.boxScoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
}
