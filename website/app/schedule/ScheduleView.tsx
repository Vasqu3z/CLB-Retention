'use client';

import { useState } from 'react';
import { ScheduleGame } from '@/lib/sheets';
import { Team } from '@/config/league';
import { getTeamByName } from '@/config/league';

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
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">Season Schedule</h1>

        {/* Team Filter */}
        <div className="flex items-center gap-3">
          <label htmlFor="team-filter" className="text-sm font-medium text-gray-700">
            Filter by Team:
          </label>
          <select
            id="team-filter"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

      <div className="space-y-8">
        {weekKeys.map((weekKey) => {
          const weekGames = gamesByWeek[weekKey].filter(filterGame);

          if (weekGames.length === 0) return null;

          return (
            <div key={weekKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                <h2 className="text-xl font-bold text-gray-800">{weekKey}</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {weekGames.map((game, idx) => (
                  <GameRow key={`${weekKey}-${idx}`} game={game} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-600 rounded"></span>
            Winner
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded"></span>
            Loser
          </span>
          <span className="flex items-center gap-2">
            <span className="italic text-gray-500">Italic</span>
            Upcoming Game
          </span>
        </div>
      </div>
    </div>
  );
}

function GameRow({ game }: { game: ScheduleGame }) {
  if (!game.played) {
    // Upcoming game
    return (
      <div className="px-6 py-4 hover:bg-gray-50 transition">
        <div className="text-gray-500 italic text-center">
          <span className="font-medium">{game.homeTeam}</span>
          {' vs '}
          <span className="font-medium">{game.awayTeam}</span>
        </div>
      </div>
    );
  }

  // Completed game
  const homeWon = game.winner === game.homeTeam;
  const awayWon = game.winner === game.awayTeam;

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition">
      <div className="flex items-center justify-center gap-4 text-lg">
        {/* Home Team */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <span
            className="font-semibold truncate"
            style={{
              color: homeWon ? '#059669' : '#DC2626',
              fontWeight: homeWon ? 'bold' : 'normal'
            }}
          >
            {game.homeTeam}
          </span>
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: homeWon ? '#059669' : '#DC2626' }}
          >
            {game.homeScore}
          </span>
        </div>

        {/* Divider */}
        <span className="text-gray-400 font-bold">-</span>

        {/* Away Team */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: awayWon ? '#059669' : '#DC2626' }}
          >
            {game.awayScore}
          </span>
          <span
            className="font-semibold truncate"
            style={{
              color: awayWon ? '#059669' : '#DC2626',
              fontWeight: awayWon ? 'bold' : 'normal'
            }}
          >
            {game.awayTeam}
          </span>
        </div>
      </div>
    </div>
  );
}
