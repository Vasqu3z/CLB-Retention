'use client';

import { useState } from 'react';
import { Team } from '@/config/league';
import { PlayerStats, ScheduleGame } from '@/lib/sheets';
import Link from 'next/link';

interface TeamPageViewProps {
  team: Team;
  roster: PlayerStats[];
  schedule: ScheduleGame[];
}

type SortField = keyof PlayerStats | 'none';
type SortDirection = 'asc' | 'desc';

export default function TeamPageView({ team, roster, schedule }: TeamPageViewProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Separate players by role
  const hitters = roster.filter((p) => p.ab && p.ab > 0);
  const pitchers = roster.filter((p) => p.ip && p.ip > 0);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for stats
    }
  };

  const sortPlayers = (players: PlayerStats[]) => {
    return [...players].sort((a, b) => {
      const aVal = a[sortField as keyof PlayerStats];
      const bVal = b[sortField as keyof PlayerStats];

      if (aVal === undefined || bVal === undefined) return 0;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const sortedHitters = sortPlayers(hitters);
  const sortedPitchers = sortPlayers(pitchers);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Team Header */}
      <div
        className="mb-8 p-6 rounded-lg"
        style={{ backgroundColor: `${team.primaryColor}20`, borderLeft: `4px solid ${team.primaryColor}` }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: team.primaryColor }}>
          {team.name}
        </h1>
        <p className="text-gray-600 text-lg">
          {team.mascot} • {roster.length} Players
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <a href="#hitting" className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
            Hitting
          </a>
          <a href="#pitching" className="border-transparent py-4 px-1 hover:border-gray-300 hover:text-gray-700">
            Pitching
          </a>
          <a href="#schedule" className="border-transparent py-4 px-1 hover:border-gray-300 hover:text-gray-700">
            Schedule
          </a>
        </nav>
      </div>

      {/* Hitting Stats */}
      <section id="hitting" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Hitting Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="gp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="ab" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  AB
                </SortableHeader>
                <SortableHeader field="h" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  H
                </SortableHeader>
                <SortableHeader field="hr" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  HR
                </SortableHeader>
                <SortableHeader field="rbi" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  RBI
                </SortableHeader>
                <SortableHeader field="avg" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  AVG
                </SortableHeader>
                <SortableHeader field="obp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  OBP
                </SortableHeader>
                <SortableHeader field="slg" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  SLG
                </SortableHeader>
                <SortableHeader field="ops" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  OPS
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedHitters.map((player, idx) => (
                <tr key={player.name} className={`border-b ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{player.name}</td>
                  <td className="px-4 py-3 text-center">{player.gp}</td>
                  <td className="px-4 py-3 text-center">{player.ab}</td>
                  <td className="px-4 py-3 text-center">{player.h}</td>
                  <td className="px-4 py-3 text-center">{player.hr}</td>
                  <td className="px-4 py-3 text-center">{player.rbi}</td>
                  <td className="px-4 py-3 text-center">{player.avg}</td>
                  <td className="px-4 py-3 text-center">{player.obp}</td>
                  <td className="px-4 py-3 text-center">{player.slg}</td>
                  <td className="px-4 py-3 text-center">{player.ops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pitching Stats */}
      <section id="pitching" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Pitching Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="gp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="ip" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  IP
                </SortableHeader>
                <SortableHeader field="w" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  W
                </SortableHeader>
                <SortableHeader field="l" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  L
                </SortableHeader>
                <SortableHeader field="sv" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  SV
                </SortableHeader>
                <SortableHeader field="era" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  ERA
                </SortableHeader>
                <SortableHeader field="whip" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  WHIP
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedPitchers.map((player, idx) => (
                <tr key={player.name} className={`border-b ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{player.name}</td>
                  <td className="px-4 py-3 text-center">{player.gp}</td>
                  <td className="px-4 py-3 text-center">{player.ip}</td>
                  <td className="px-4 py-3 text-center">{player.w}</td>
                  <td className="px-4 py-3 text-center">{player.l}</td>
                  <td className="px-4 py-3 text-center">{player.sv}</td>
                  <td className="px-4 py-3 text-center">{player.era}</td>
                  <td className="px-4 py-3 text-center">{player.whip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Team Schedule */}
      <section id="schedule" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Team Schedule</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {schedule.map((game, idx) => (
              <TeamGameRow key={idx} game={game} teamName={team.name} />
            ))}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/standings" className="text-blue-600 hover:underline">
          ← Back to Standings
        </Link>
      </div>
    </div>
  );
}

// Sortable Header Component
function SortableHeader({
  field,
  sortField,
  sortDirection,
  onSort,
  children,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = sortField === field;

  return (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

// Team Game Row Component
function TeamGameRow({ game, teamName }: { game: ScheduleGame; teamName: string }) {
  const isHome = game.homeTeam === teamName;
  const opponent = isHome ? game.awayTeam : game.homeTeam;

  if (!game.played) {
    return (
      <div className="px-6 py-4">
        <div className="text-sm text-gray-500">
          Week {game.week} • vs {opponent} {isHome ? '(Home)' : '(Away)'}
        </div>
      </div>
    );
  }

  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  const won = game.winner === teamName;

  const content = (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-1">Week {game.week}</div>
          <div className="font-medium" style={{ color: won ? '#059669' : '#DC2626' }}>
            {won ? 'W' : 'L'} {teamScore}-{oppScore} vs {opponent} {isHome ? '(Home)' : '(Away)'}
          </div>
        </div>
        {game.boxScoreUrl && (
          <a
            href={game.boxScoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Box Score →
          </a>
        )}
      </div>
    </div>
  );

  return content;
}
