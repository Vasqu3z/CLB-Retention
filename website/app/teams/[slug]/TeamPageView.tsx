'use client';

import { useState } from 'react';
import { Team } from '@/config/league';
import { PlayerStats, ScheduleGame, PlayoffGame, StandingsRow, TeamData } from '@/lib/sheets';
import Link from 'next/link';
import SeasonToggle from '@/components/SeasonToggle';
import FadeIn from '@/components/animations/FadeIn';

interface TeamPageViewProps {
  team: Team;
  regularRoster: PlayerStats[];
  regularSchedule: ScheduleGame[];
  regularStanding?: StandingsRow;
  regularTeamData?: TeamData;
  playoffRoster: PlayerStats[];
  playoffSchedule: PlayoffGame[];
  playoffStanding?: StandingsRow;
  playoffTeamData?: TeamData;
}

type SortField = keyof PlayerStats | 'none';
type SortDirection = 'asc' | 'desc';

export default function TeamPageView({
  team,
  regularRoster,
  regularSchedule,
  regularStanding,
  regularTeamData,
  playoffRoster,
  playoffSchedule,
  playoffStanding,
  playoffTeamData,
}: TeamPageViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);

  // Use appropriate data based on toggle
  const roster = isPlayoffs ? playoffRoster : regularRoster;
  const schedule: (ScheduleGame | PlayoffGame)[] = isPlayoffs ? playoffSchedule : regularSchedule;
  const standing = isPlayoffs ? playoffStanding : regularStanding;
  const teamData = isPlayoffs ? playoffTeamData : regularTeamData;
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Separate players by role
  const hitters = roster.filter((p) => p.ab && p.ab > 0);
  const pitchers = roster.filter((p) => p.ip && p.ip > 0);
  const fielders = roster.filter((p) => (p.np && p.np > 0) || (p.e && p.e > 0) || (p.sb && p.sb > 0));

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
  const sortedFielders = sortPlayers(fielders);

  // Use Team Data totals (only counts stats from games this team played)
  // Calculate rate stats from raw Team Data stats
  const teamAvg = teamData && teamData.hitting.ab > 0
    ? (teamData.hitting.h / teamData.hitting.ab).toFixed(3).substring(1)
    : '.000';

  const teamOBP = teamData && (teamData.hitting.ab + teamData.hitting.bb) > 0
    ? ((teamData.hitting.h + teamData.hitting.bb) / (teamData.hitting.ab + teamData.hitting.bb)).toFixed(3).substring(1)
    : '.000';

  const teamSLG = teamData && teamData.hitting.ab > 0
    ? (teamData.hitting.tb / teamData.hitting.ab).toFixed(3).substring(1)
    : '.000';

  // Calculate OPS from raw stats (not from formatted OBP/SLG strings) since OPS can be > 1.000
  const teamOPS = teamData && teamData.hitting.ab > 0 && (teamData.hitting.ab + teamData.hitting.bb) > 0
    ? ((teamData.hitting.h + teamData.hitting.bb) / (teamData.hitting.ab + teamData.hitting.bb) +
       teamData.hitting.tb / teamData.hitting.ab).toFixed(3)
    : '0.000';

  const teamERA = teamData && teamData.pitching.ip > 0
    ? ((teamData.pitching.r * 9) / teamData.pitching.ip).toFixed(2)
    : '0.00';

  const teamWHIP = teamData && teamData.pitching.ip > 0
    ? ((teamData.pitching.h + teamData.pitching.bb) / teamData.pitching.ip).toFixed(2)
    : '0.00';

  const teamBAA = teamData && teamData.pitching.bf > 0
    ? (teamData.pitching.h / teamData.pitching.bf).toFixed(3).substring(1)
    : '.000';

  // SV is not in Team Data, so sum from players
  const teamSV = pitchers.reduce((acc, p) => acc + (p.sv || 0), 0);

  // Calculate team OAA (Outs Above Average)
  const teamOAA = teamData ? teamData.fielding.np - teamData.fielding.e : 0;

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <FadeIn delay={0} direction="down">
        <div className="glass-card p-6" style={{ borderLeft: `4px solid ${team.primaryColor}` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl font-display font-bold" style={{ color: team.primaryColor }}>
              {team.name}
            </h1>
            <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
          </div>

        {/* Team Stats Summary */}
        {standing && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Record</div>
              <div className="text-xl font-bold font-mono text-star-white">
                {standing.wins}-{standing.losses}
              </div>
            </div>
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Win %</div>
              <div className="text-xl font-bold font-mono text-nebula-cyan">{standing.winPct}</div>
            </div>
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Runs Scored</div>
              <div className="text-xl font-bold font-mono text-nebula-orange">{standing.runsScored}</div>
            </div>
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Runs Allowed</div>
              <div className="text-xl font-bold font-mono text-nebula-coral">{standing.runsAllowed}</div>
            </div>
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Run Diff</div>
              <div
                className={`text-xl font-bold font-mono ${
                  standing.runDiff > 0
                    ? 'text-nebula-teal'
                    : standing.runDiff < 0
                    ? 'text-nebula-coral'
                    : 'text-star-white'
                }`}
              >
                {standing.runDiff > 0 ? '+' : ''}
                {standing.runDiff}
              </div>
            </div>
            <div>
              <div className="text-xs font-display text-star-gray uppercase tracking-wider">Rank</div>
              <div className="text-xl font-bold font-mono text-solar-gold">{standing.rank}</div>
            </div>
          </div>
        )}

        <p className="text-star-gray text-sm font-mono">
          {team.mascot} • {roster.length} Players
        </p>
        </div>
      </FadeIn>

      {/* Navigation Tabs */}
      <FadeIn delay={0.15} direction="up">
        <div className="glass-card p-2">
          <nav className="flex space-x-2 overflow-x-auto">
          <a href="#hitting" className="flex-1 min-w-fit py-3 px-4 rounded-lg font-display font-semibold bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg transition-all text-center">
            Hitting
          </a>
          <a href="#pitching" className="flex-1 min-w-fit py-3 px-4 rounded-lg font-display font-semibold text-star-gray hover:text-star-white hover:bg-space-black/30 transition-all text-center">
            Pitching
          </a>
          <a href="#fielding" className="flex-1 min-w-fit py-3 px-4 rounded-lg font-display font-semibold text-star-gray hover:text-star-white hover:bg-space-black/30 transition-all text-center">
            Fielding
          </a>
          <a href="#schedule" className="flex-1 min-w-fit py-3 px-4 rounded-lg font-display font-semibold text-star-gray hover:text-star-white hover:bg-space-black/30 transition-all text-center">
            Schedule
          </a>
        </nav>
        </div>
      </FadeIn>

      {/* Hitting Stats */}
      <FadeIn delay={0.25} direction="up">
        <section id="hitting">
          <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-orange to-nebula-coral bg-clip-text text-transparent">Hitting Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
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
                <SortableHeader field="dp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  DP
                </SortableHeader>
                <SortableHeader field="rob" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  ROB
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
                <tr key={player.name} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.ab}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.h}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hr}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.rbi}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.dp || 0}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.rob || 0}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.avg}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.obp}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.slg}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.ops}</td>
                </tr>
              ))}
              {/* Team Totals Row */}
              {teamData && (
                <tr className="border-t-2 border-nebula-orange/50 bg-space-black/40 font-bold">
                  <td className="px-4 py-3 text-nebula-orange">Team Totals</td>
                  <td className="px-4 py-3 text-center text-solar-gold">{teamData.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.ab}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.h}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.hr}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.rbi}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.dp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.hitting.rob}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamAvg}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamOBP}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamSLG}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamOPS}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </section>
      </FadeIn>

      {/* Pitching Stats */}
      <FadeIn delay={0.35} direction="up">
        <section id="pitching">
          <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-cyan to-nebula-teal bg-clip-text text-transparent">Pitching Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
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
                <SortableHeader field="hAllowed" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  H
                </SortableHeader>
                <SortableHeader field="hrAllowed" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  HR
                </SortableHeader>
                <SortableHeader field="whip" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  WHIP
                </SortableHeader>
                <SortableHeader field="baa" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  BAA
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedPitchers.map((player, idx) => (
                <tr key={player.name} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.ip?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.w}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.l}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.sv}</td>
                  <td className="px-4 py-3 text-center text-nebula-teal">{player.era}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hAllowed || 0}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hrAllowed || 0}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.whip}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.baa || '—'}</td>
                </tr>
              ))}
              {/* Team Totals Row */}
              {teamData && (
                <tr className="border-t-2 border-nebula-teal/50 bg-space-black/40 font-bold">
                  <td className="px-4 py-3 text-nebula-teal">Team Totals</td>
                  <td className="px-4 py-3 text-center text-solar-gold">{teamData.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.pitching.ip.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.wins}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.losses}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.pitching.sv}</td>
                  <td className="px-4 py-3 text-center text-nebula-teal">{teamERA}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.pitching.h}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.pitching.hr}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamWHIP}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamBAA}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </section>
      </FadeIn>

      {/* Fielding Stats */}
      <FadeIn delay={0.45} direction="up">
        <section id="fielding">
          <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-solar-gold to-comet-yellow bg-clip-text text-transparent">Fielding & Baserunning Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
              <tr>
                <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="gp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="np" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  NP
                </SortableHeader>
                <SortableHeader field="e" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  E
                </SortableHeader>
                <SortableHeader field="oaa" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  OAA
                </SortableHeader>
                <SortableHeader field="sb" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  SB
                </SortableHeader>
                <SortableHeader field="cs" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>
                  CS
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedFielders.map((player, idx) => (
                <tr key={player.name} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.np || 0}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.e || 0}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">
                    {player.oaa !== undefined && player.oaa > 0 ? '+' : ''}{player.oaa || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-star-white">{player.sb || 0}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.cs || 0}</td>
                </tr>
              ))}
              {/* Team Totals Row */}
              {teamData && (
                <tr className="border-t-2 border-solar-gold/50 bg-space-black/40 font-bold">
                  <td className="px-4 py-3 text-solar-gold">Team Totals</td>
                  <td className="px-4 py-3 text-center text-solar-gold">{teamData.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.fielding.np}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.fielding.e}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{teamOAA > 0 ? '+' : ''}{teamOAA}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.fielding.sb}</td>
                  <td className="px-4 py-3 text-center text-star-white">{teamData.fielding.cs}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </section>
      </FadeIn>

      {/* Team Schedule */}
      <FadeIn delay={0.55} direction="up">
        <section id="schedule">
          <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-cyan to-star-pink bg-clip-text text-transparent">Team Schedule</h2>
        <div className="glass-card">
          <div className="divide-y divide-star-gray/10">
            {schedule.map((game, idx) => (
              <TeamGameRow key={idx} game={game} teamName={team.name} />
            ))}
          </div>
        </div>
        </section>
      </FadeIn>

      {/* Back Link */}
      <FadeIn delay={0.65} direction="up">
        <div className="flex justify-start">
          <Link href="/standings" className="text-nebula-cyan hover:text-nebula-teal transition-colors font-mono text-sm">
            ← Back to Standings
          </Link>
        </div>
      </FadeIn>
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
      className="px-4 py-3 text-left text-sm font-display font-semibold text-star-white cursor-pointer hover:bg-space-blue/30 transition-colors duration-300"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && (
          <span className="text-nebula-orange">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

// Team Game Row Component
function TeamGameRow({ game, teamName }: { game: ScheduleGame | PlayoffGame; teamName: string }) {
  const isHome = game.homeTeam === teamName;
  const opponent = isHome ? game.awayTeam : game.homeTeam;

  // Determine the game identifier (week number or playoff code)
  const gameIdentifier = 'week' in game ? `Week ${game.week}` : game.code;

  if (!game.played) {
    return (
      <div className="px-6 py-4">
        <div className="text-sm text-star-gray font-mono">
          {gameIdentifier} • vs {opponent} {isHome ? '(Home)' : '(Away)'}
        </div>
      </div>
    );
  }

  const teamScore = isHome ? game.homeScore : game.awayScore;
  const oppScore = isHome ? game.awayScore : game.homeScore;
  const won = game.winner === teamName;

  const content = (
    <div className="px-6 py-4 hover:bg-space-blue/30 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-star-gray font-mono mb-1">{gameIdentifier}</div>
          <div className="font-semibold font-mono" style={{ color: won ? '#00B8B8' : '#FF6B6B' }}>
            {won ? 'W' : 'L'} {teamScore}-{oppScore} vs {opponent} {isHome ? '(Home)' : '(Away)'}
          </div>
        </div>
        {game.boxScoreUrl && (
          <a
            href={game.boxScoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-nebula-cyan hover:text-nebula-teal transition-colors font-mono"
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
