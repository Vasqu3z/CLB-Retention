'use client';

import { useState } from 'react';
import { TeamData, StandingsRow } from '@/lib/sheets';
import Link from 'next/link';
import { getActiveTeams } from '@/config/league';

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
  return (
    <th
      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  );
}

interface TeamStatsViewProps {
  teamData: TeamData[];
  standings: StandingsRow[];
}

export default function TeamStatsView({ teamData, standings }: TeamStatsViewProps) {
  const [hittingSortField, setHittingSortField] = useState<SortField>('rGame');
  const [hittingSortDirection, setHittingSortDirection] = useState<SortDirection>('desc');
  const [pitchingSortField, setPitchingSortField] = useState<SortField>('era');
  const [pitchingSortDirection, setPitchingSortDirection] = useState<SortDirection>('asc');
  const [fieldingSortField, setFieldingSortField] = useState<SortField>('der');
  const [fieldingSortDirection, setFieldingSortDirection] = useState<SortDirection>('desc');

  const teams = getActiveTeams();

  // Helper to get team color
  const getTeamColor = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.primaryColor || '#000000';
  };

  // Helper to get team slug
  const getTeamSlug = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.slug || '';
  };

  // Calculate derived stats and prepare data (filter to active teams only)
  const activeTeamNames = teams.map(t => t.name);
  const enhancedTeamData = teamData
    .filter(team => activeTeamNames.includes(team.teamName))
    .map(team => {
      // Get runs scored from standings
      const standingsEntry = standings.find(s => s.team === team.teamName);
      const runsScored = standingsEntry?.runsScored || 0;

    // Calculate rate stats
    const avg = team.hitting.ab > 0 ? (team.hitting.h / team.hitting.ab).toFixed(3).substring(1) : '.000';
    const obp = (team.hitting.ab + team.hitting.bb) > 0
      ? ((team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb)).toFixed(3).substring(1)
      : '.000';
    const slg = team.hitting.ab > 0 ? (team.hitting.tb / team.hitting.ab).toFixed(3).substring(1) : '.000';
    const ops = team.hitting.ab > 0 && (team.hitting.ab + team.hitting.bb) > 0
      ? ((team.hitting.h + team.hitting.bb) / (team.hitting.ab + team.hitting.bb) +
         team.hitting.tb / team.hitting.ab).toFixed(3)
      : '0.000';

    const era = team.pitching.ip > 0 ? ((team.pitching.r * 9) / team.pitching.ip).toFixed(2) : '0.00';
    const whip = team.pitching.ip > 0 ? ((team.pitching.h + team.pitching.bb) / team.pitching.ip).toFixed(2) : '0.00';
    const baa = team.pitching.bf > 0 ? (team.pitching.h / team.pitching.bf).toFixed(3).substring(1) : '.000';

    // New derived stats
    const rGame = team.gp > 0 ? (runsScored / team.gp).toFixed(2) : '0.00'; // Runs scored per game
    const oaa = team.fielding.np - team.fielding.e; // Outs Above Average
    const der = team.gp > 0 ? (oaa / team.gp).toFixed(2) : '0.00'; // Defensive Efficiency Rating (OAA/Game)

    return {
      ...team,
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
      color: getTeamColor(team.teamName),
      slug: getTeamSlug(team.teamName),
    };
  });

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

  const sortedHittingTeams = [...enhancedTeamData].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (hittingSortField) {
      case 'teamName': return hittingSortDirection === 'asc'
        ? a.teamName.localeCompare(b.teamName)
        : b.teamName.localeCompare(a.teamName);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'ab': aVal = a.hitting.ab; bVal = b.hitting.ab; break;
      case 'h': aVal = a.hitting.h; bVal = b.hitting.h; break;
      case 'hr': aVal = a.hitting.hr; bVal = b.hitting.hr; break;
      case 'rbi': aVal = a.hitting.rbi; bVal = b.hitting.rbi; break;
      case 'rob': aVal = a.hitting.rob; bVal = b.hitting.rob; break;
      case 'dp': aVal = a.hitting.dp; bVal = b.hitting.dp; break;
      case 'avg': aVal = parseFloat(a.avg); bVal = parseFloat(b.avg); break;
      case 'obp': aVal = parseFloat(a.obp); bVal = parseFloat(b.obp); break;
      case 'slg': aVal = parseFloat(a.slg); bVal = parseFloat(b.slg); break;
      case 'ops': aVal = parseFloat(a.ops); bVal = parseFloat(b.ops); break;
      case 'rGame': aVal = parseFloat(a.rGame); bVal = parseFloat(b.rGame); break;
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
      // Lower is better for ERA, WHIP, BAA; higher is better for W, SV, etc.
      const lowerIsBetter = ['era', 'whip', 'baa'].includes(field);
      setPitchingSortDirection(lowerIsBetter ? 'asc' : 'desc');
    }
  };

  const sortedPitchingTeams = [...enhancedTeamData].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (pitchingSortField) {
      case 'teamName': return pitchingSortDirection === 'asc'
        ? a.teamName.localeCompare(b.teamName)
        : b.teamName.localeCompare(a.teamName);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'ip': aVal = a.pitching.ip; bVal = b.pitching.ip; break;
      case 'w': aVal = a.wins; bVal = b.wins; break;
      case 'l': aVal = a.losses; bVal = b.losses; break;
      case 'sv': aVal = a.pitching.k; bVal = b.pitching.k; break; // Assuming SV is tracked elsewhere
      case 'hr': aVal = a.pitching.hr; bVal = b.pitching.hr; break;
      case 'era': aVal = parseFloat(a.era); bVal = parseFloat(b.era); break;
      case 'whip': aVal = parseFloat(a.whip); bVal = parseFloat(b.whip); break;
      case 'baa': aVal = parseFloat(a.baa); bVal = parseFloat(b.baa); break;
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
      // Higher is better for NP, OAA, DER, CS; lower is better for E, SB
      const lowerIsBetter = ['e', 'sb'].includes(field);
      setFieldingSortDirection(lowerIsBetter ? 'asc' : 'desc');
    }
  };

  const sortedFieldingTeams = [...enhancedTeamData].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (fieldingSortField) {
      case 'teamName': return fieldingSortDirection === 'asc'
        ? a.teamName.localeCompare(b.teamName)
        : b.teamName.localeCompare(a.teamName);
      case 'gp': aVal = a.gp; bVal = b.gp; break;
      case 'np': aVal = a.fielding.np; bVal = b.fielding.np; break;
      case 'e': aVal = a.fielding.e; bVal = b.fielding.e; break;
      case 'sb': aVal = a.fielding.sb; bVal = b.fielding.sb; break;
      case 'cs': aVal = a.fielding.cs; bVal = b.fielding.cs; break;
      case 'oaa': aVal = a.oaa; bVal = b.oaa; break;
      case 'der': aVal = parseFloat(a.der); bVal = parseFloat(b.der); break;
      default: return 0;
    }

    if (fieldingSortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  return (
    <div className="space-y-12">
      {/* Hitting Statistics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Hitting Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="teamName" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  GP
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
                <SortableHeader field="rGame" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  R/G
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
                <SortableHeader field="rob" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  ROB
                </SortableHeader>
                <SortableHeader field="dp" sortField={hittingSortField} sortDirection={hittingSortDirection} onSort={handleHittingSort}>
                  DP
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedHittingTeams.map((team, idx) => (
                <tr key={team.teamName} className={`border-b ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/teams/${team.slug}`} className="hover:underline" style={{ color: team.color }}>
                      {team.teamName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{team.gp}</td>
                  <td className="px-4 py-3 text-center">{team.avg}</td>
                  <td className="px-4 py-3 text-center">{team.obp}</td>
                  <td className="px-4 py-3 text-center">{team.slg}</td>
                  <td className="px-4 py-3 text-center">{team.ops}</td>
                  <td className="px-4 py-3 text-center font-semibold">{team.rGame}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.ab}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.h}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.hr}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.rbi}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.rob}</td>
                  <td className="px-4 py-3 text-center">{team.hitting.dp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pitching Statistics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Pitching Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="teamName" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  GP
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
                <SortableHeader field="ip" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  IP
                </SortableHeader>
                <SortableHeader field="w" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  W
                </SortableHeader>
                <SortableHeader field="l" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  L
                </SortableHeader>
                <SortableHeader field="hr" sortField={pitchingSortField} sortDirection={pitchingSortDirection} onSort={handlePitchingSort}>
                  HR
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedPitchingTeams.map((team, idx) => (
                <tr key={team.teamName} className={`border-b ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/teams/${team.slug}`} className="hover:underline" style={{ color: team.color }}>
                      {team.teamName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{team.gp}</td>
                  <td className="px-4 py-3 text-center font-semibold">{team.era}</td>
                  <td className="px-4 py-3 text-center">{team.whip}</td>
                  <td className="px-4 py-3 text-center">{team.baa}</td>
                  <td className="px-4 py-3 text-center">{team.pitching.ip.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{team.wins}</td>
                  <td className="px-4 py-3 text-center">{team.losses}</td>
                  <td className="px-4 py-3 text-center">{team.pitching.hr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fielding Statistics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Fielding & Baserunning Statistics</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="teamName" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  Team
                </SortableHeader>
                <SortableHeader field="gp" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  GP
                </SortableHeader>
                <SortableHeader field="der" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  DER
                </SortableHeader>
                <SortableHeader field="oaa" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  OAA
                </SortableHeader>
                <SortableHeader field="np" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  NP
                </SortableHeader>
                <SortableHeader field="e" sortField={fieldingSortField} sortDirection={fieldingSortDirection} onSort={handleFieldingSort}>
                  E
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
              {sortedFieldingTeams.map((team, idx) => (
                <tr key={team.teamName} className={`border-b ${idx % 2 === 1 ? 'bg-gray-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/teams/${team.slug}`} className="hover:underline" style={{ color: team.color }}>
                      {team.teamName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{team.gp}</td>
                  <td className="px-4 py-3 text-center font-semibold">{parseFloat(team.der) > 0 ? '+' : ''}{team.der}</td>
                  <td className="px-4 py-3 text-center">{team.oaa > 0 ? '+' : ''}{team.oaa}</td>
                  <td className="px-4 py-3 text-center">{team.fielding.np}</td>
                  <td className="px-4 py-3 text-center">{team.fielding.e}</td>
                  <td className="px-4 py-3 text-center">{team.fielding.sb}</td>
                  <td className="px-4 py-3 text-center">{team.fielding.cs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
