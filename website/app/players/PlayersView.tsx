'use client';

import { useState } from 'react';
import { PlayerStats } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import SeasonToggle from '@/components/SeasonToggle';

type SortField = string;
type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

function SortableHeader({ field, sortField, sortDirection, onSort, children }: SortableHeaderProps) {
  const isActive = sortField === field;

  return (
    <th
      className="px-4 py-3 text-left font-display font-semibold text-star-white cursor-pointer hover:bg-space-blue/30 transition-colors duration-300"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {isActive && (
          <span className="text-nebula-orange text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );
}

interface PlayersViewProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function PlayersView({
  regularPlayers,
  playoffPlayers
}: PlayersViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);

  // Use appropriate data based on toggle
  const players = isPlayoffs ? playoffPlayers : regularPlayers;

  const [hittingSortField, setHittingSortField] = useState<SortField>('avg');
  const [hittingSortDirection, setHittingSortDirection] = useState<SortDirection>('desc');
  const [pitchingSortField, setPitchingSortField] = useState<SortField>('era');
  const [pitchingSortDirection, setPitchingSortDirection] = useState<SortDirection>('asc');
  const [fieldingSortField, setFieldingSortField] = useState<SortField>('np');
  const [fieldingSortDirection, setFieldingSortDirection] = useState<SortDirection>('desc');

  const teams = getActiveTeams();

  // Helper to get team color
  const getTeamColor = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.primaryColor || '#000000';
  };

  // Sorting logic for hitting
  const handleHittingSort = (field: SortField) => {
    if (hittingSortField === field) {
      setHittingSortDirection(hittingSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setHittingSortField(field);
      // Default directions: higher is better for most stats
      setHittingSortDirection('desc');
    }
  };

  // Filter players who have hitting stats
  const hitters = players.filter(p => p.ab && p.ab > 0);

  const sortedHitters = [...hitters].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (hittingSortField) {
      case 'name': return hittingSortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      case 'team': return hittingSortDirection === 'asc'
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'ab': aVal = a.ab || 0; bVal = b.ab || 0; break;
      case 'h': aVal = a.h || 0; bVal = b.h || 0; break;
      case 'hr': aVal = a.hr || 0; bVal = b.hr || 0; break;
      case 'rbi': aVal = a.rbi || 0; bVal = b.rbi || 0; break;
      case 'rob': aVal = a.rob || 0; bVal = b.rob || 0; break;
      case 'dp': aVal = a.dp || 0; bVal = b.dp || 0; break;
      case 'avg': aVal = parseFloat('0' + (a.avg || '.000')); bVal = parseFloat('0' + (b.avg || '.000')); break;
      case 'obp': aVal = parseFloat('0' + (a.obp || '.000')); bVal = parseFloat('0' + (b.obp || '.000')); break;
      case 'slg':
        // Handle SLG >= 1.000
        aVal = (a.slg || '.000').startsWith('.') ? parseFloat('0' + a.slg!) : parseFloat(a.slg!);
        bVal = (b.slg || '.000').startsWith('.') ? parseFloat('0' + b.slg!) : parseFloat(b.slg!);
        break;
      case 'ops': aVal = parseFloat(a.ops || '0.000'); bVal = parseFloat(b.ops || '0.000'); break;
      default: return 0;
    }

    if (hittingSortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Sorting logic for pitching
  const handlePitchingSort = (field: SortField) => {
    if (pitchingSortField === field) {
      setPitchingSortDirection(pitchingSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPitchingSortField(field);
      // Lower is better for ERA, WHIP, BAA
      const lowerIsBetter = ['era', 'whip', 'baa'].includes(field);
      setPitchingSortDirection(lowerIsBetter ? 'asc' : 'desc');
    }
  };

  // Filter players who have pitching stats
  const pitchers = players.filter(p => p.ip && p.ip > 0);

  const sortedPitchers = [...pitchers].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (pitchingSortField) {
      case 'name': return pitchingSortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      case 'team': return pitchingSortDirection === 'asc'
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'ip': aVal = a.ip || 0; bVal = b.ip || 0; break;
      case 'w': aVal = a.w || 0; bVal = b.w || 0; break;
      case 'l': aVal = a.l || 0; bVal = b.l || 0; break;
      case 'sv': aVal = a.sv || 0; bVal = b.sv || 0; break;
      case 'hAllowed': aVal = a.hAllowed || 0; bVal = b.hAllowed || 0; break;
      case 'hrAllowed': aVal = a.hrAllowed || 0; bVal = b.hrAllowed || 0; break;
      case 'era': aVal = parseFloat(a.era || '0.00'); bVal = parseFloat(b.era || '0.00'); break;
      case 'whip': aVal = parseFloat(a.whip || '0.00'); bVal = parseFloat(b.whip || '0.00'); break;
      case 'baa': aVal = parseFloat('0' + (a.baa || '.000')); bVal = parseFloat('0' + (b.baa || '.000')); break;
      default: return 0;
    }

    if (pitchingSortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  // Sorting logic for fielding
  const handleFieldingSort = (field: SortField) => {
    if (fieldingSortField === field) {
      setFieldingSortDirection(fieldingSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setFieldingSortField(field);
      // Higher is better for NP, OAA; lower is better for E
      const lowerIsBetter = ['e'].includes(field);
      setFieldingSortDirection(lowerIsBetter ? 'asc' : 'desc');
    }
  };

  // Filter players who have fielding stats
  const fielders = players.filter(p => p.np && p.np > 0);

  const sortedFielders = [...fielders].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (fieldingSortField) {
      case 'name': return fieldingSortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      case 'team': return fieldingSortDirection === 'asc'
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'np': aVal = a.np || 0; bVal = b.np || 0; break;
      case 'e': aVal = a.e || 0; bVal = b.e || 0; break;
      case 'sb': aVal = a.sb || 0; bVal = b.sb || 0; break;
      case 'cs': aVal = a.cs || 0; bVal = b.cs || 0; break;
      case 'oaa': aVal = a.oaa || 0; bVal = b.oaa || 0; break;
      default: return 0;
    }

    if (fieldingSortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Season Toggle */}
      <div className="flex justify-end">
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      {/* Hitting Statistics */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-orange to-nebula-coral bg-clip-text text-transparent">Hitting Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
              <tr>
                <SortableHeader field="name" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="team" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="ab" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  AB
                </SortableHeader>
                <SortableHeader field="h" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  H
                </SortableHeader>
                <SortableHeader field="hr" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  HR
                </SortableHeader>
                <SortableHeader field="rbi" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  RBI
                </SortableHeader>
                <SortableHeader field="dp" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  DP
                </SortableHeader>
                <SortableHeader field="rob" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  ROB
                </SortableHeader>
                <SortableHeader field="avg" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  AVG
                </SortableHeader>
                <SortableHeader field="obp" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  OBP
                </SortableHeader>
                <SortableHeader field="slg" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  SLG
                </SortableHeader>
                <SortableHeader field="ops" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  OPS
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedHitters.map((player, idx) => (
                <tr key={`${player.name}-${player.team}`} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3" style={{ color: getTeamColor(player.team) }}>
                    {player.team}
                  </td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.ab}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.h}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hr}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.rbi}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.dp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.rob}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.avg}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.obp}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.slg}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.ops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pitching Statistics */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-cyan to-nebula-teal bg-clip-text text-transparent">Pitching Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
              <tr>
                <SortableHeader field="name" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="team" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="ip" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  IP
                </SortableHeader>
                <SortableHeader field="w" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  W
                </SortableHeader>
                <SortableHeader field="l" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  L
                </SortableHeader>
                <SortableHeader field="sv" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  SV
                </SortableHeader>
                <SortableHeader field="hAllowed" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  H
                </SortableHeader>
                <SortableHeader field="hrAllowed" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  HR
                </SortableHeader>
                <SortableHeader field="era" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  ERA
                </SortableHeader>
                <SortableHeader field="whip" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  WHIP
                </SortableHeader>
                <SortableHeader field="baa" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  BAA
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedPitchers.map((player, idx) => (
                <tr key={`${player.name}-${player.team}`} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3" style={{ color: getTeamColor(player.team) }}>
                    {player.team}
                  </td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.ip?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.w}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.l}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.sv}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hAllowed}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.hrAllowed}</td>
                  <td className="px-4 py-3 text-center text-nebula-teal">{player.era}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.whip}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.baa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fielding Statistics */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-4 bg-gradient-to-r from-solar-gold to-comet-yellow bg-clip-text text-transparent">Fielding & Baserunning Statistics</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
              <tr>
                <SortableHeader field="name" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  Player
                </SortableHeader>
                <SortableHeader field="team" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="np" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  NP
                </SortableHeader>
                <SortableHeader field="e" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  E
                </SortableHeader>
                <SortableHeader field="oaa" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  OAA
                </SortableHeader>
                <SortableHeader field="sb" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  SB
                </SortableHeader>
                <SortableHeader field="cs" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  CS
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedFielders.map((player, idx) => (
                <tr key={`${player.name}-${player.team}`} className="border-b border-star-gray/10 hover:bg-space-blue/30 transition-colors duration-300">
                  <td className="px-4 py-3 font-semibold text-star-white">{player.name}</td>
                  <td className="px-4 py-3" style={{ color: getTeamColor(player.team) }}>
                    {player.team}
                  </td>
                  <td className="px-4 py-3 text-center text-star-gray">{player.gp}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.np}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.e}</td>
                  <td className="px-4 py-3 text-center text-nebula-cyan">{player.oaa && player.oaa > 0 ? '+' : ''}{player.oaa}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.sb}</td>
                  <td className="px-4 py-3 text-center text-star-white">{player.cs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
