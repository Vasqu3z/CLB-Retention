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
    <div className="max-w-7xl mx-auto">
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

      <div className="space-y-12">
        {weekKeys.map((weekKey) => {
          const weekGames = gamesByWeek[weekKey].filter(filterGame);

          if (weekGames.length === 0) return null;

          return (
            <div key={weekKey} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Week Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{weekKey}</h2>
              </div>

              {/* Game Cards */}
              <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {weekGames.map((game, idx) => (
                  <GameCard key={`${weekKey}-${idx}`} game={game} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-2">How to Read the Schedule</p>
        <ul className="space-y-1">
          <li>• Green highlight indicates the winning team</li>
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
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Upcoming Game</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-gray-50">
            <span className="font-semibold text-gray-500 italic">{game.awayTeam}</span>
            <span className="text-sm text-gray-400">@</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded bg-gray-50">
            <span className="font-semibold text-gray-500 italic">{game.homeTeam}</span>
          </div>
        </div>
      </div>
    );
  }

  // Completed game
  const homeWon = game.winner === game.homeTeam;
  const awayWon = game.winner === game.awayTeam;

  const content = (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Final</span>
          {game.boxScoreUrl && (
            <span className="text-xs text-blue-600">
              View Box Score →
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-3 rounded ${
            awayWon
              ? 'bg-green-50 border-2 border-green-400'
              : 'bg-gray-50'
          }`}
        >
          <span className={`font-semibold ${
            awayWon ? 'text-green-700' : 'text-gray-900'
          }`}>
            {game.awayTeam}
          </span>
          <span className={`text-xl font-bold ${
            awayWon ? 'text-green-700' : 'text-gray-700'
          }`}>
            {game.awayScore}
          </span>
        </div>

        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-3 rounded ${
            homeWon
              ? 'bg-green-50 border-2 border-green-400'
              : 'bg-gray-50'
          }`}
        >
          <span className={`font-semibold ${
            homeWon ? 'text-green-700' : 'text-gray-900'
          }`}>
            {game.homeTeam}
          </span>
          <span className={`text-xl font-bold ${
            homeWon ? 'text-green-700' : 'text-gray-700'
          }`}>
            {game.homeScore}
          </span>
        </div>

        {/* Game Details */}
        {(game.mvp || game.winningPitcher || game.losingPitcher || game.savePitcher) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Game Details
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              {game.mvp && (
                <div className="flex justify-between">
                  <span className="font-semibold">MVP:</span>
                  <span>{game.mvp}</span>
                </div>
              )}
              {game.winningPitcher && (
                <div className="flex justify-between">
                  <span className="font-semibold">W:</span>
                  <span>{game.winningPitcher}</span>
                </div>
              )}
              {game.losingPitcher && (
                <div className="flex justify-between">
                  <span className="font-semibold">L:</span>
                  <span>{game.losingPitcher}</span>
                </div>
              )}
              {game.savePitcher && (
                <div className="flex justify-between">
                  <span className="font-semibold">SV:</span>
                  <span>{game.savePitcher}</span>
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
