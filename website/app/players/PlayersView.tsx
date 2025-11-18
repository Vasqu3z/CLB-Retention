'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlayerStats } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import SeasonToggle from '@/components/SeasonToggle';
import DataTable, { Column } from '@/components/DataTable';
import { Search } from 'lucide-react';
import { playerNameToSlug } from '@/lib/utils';
import ControlShelf from '@/components/ControlShelf';
import { QUALIFICATION_THRESHOLDS } from '@/config/sheets';

type Tab = 'hitting' | 'pitching' | 'fielding';

interface PlayersViewProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
  playoffEligibleTeams: string[];
}

export default function PlayersView({
  regularPlayers,
  playoffPlayers,
  playoffEligibleTeams
}: PlayersViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hitting');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [qualifiedOnly, setQualifiedOnly] = useState(false);
  const [spotlightPlayoffTeams, setSpotlightPlayoffTeams] = useState(false);

  // Use appropriate data based on toggle
  const players = isPlayoffs ? playoffPlayers : regularPlayers;

  const teams = getActiveTeams();

  // Helper to get team color
  const getTeamColor = (teamName: string) => {
    const team = teams.find(t => t.name === teamName);
    return team?.primaryColor || '#000000';
  };

  // Filter players by search query
  const filteredPlayers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedTeam = teamFilter === 'all'
      ? null
      : teams.find((team) => team.slug === teamFilter)?.name;

    return players.filter((player) => {
      const matchesSearch = !query
        || player.name.toLowerCase().includes(query)
        || player.team.toLowerCase().includes(query);
      const matchesTeam = !selectedTeam || player.team === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [players, searchQuery, teamFilter, teams]);

  const avgTeamGP = useMemo(() => {
    const map = new Map<string, number>();
    filteredPlayers.forEach((player) => {
      const current = map.get(player.team) ?? 0;
      map.set(player.team, Math.max(current, player.gp || 0));
    });
    const values = Array.from(map.values());
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, gp) => sum + gp, 0) / values.length;
  }, [filteredPlayers]);

  const battingThreshold = useMemo(() => {
    const base = avgTeamGP * QUALIFICATION_THRESHOLDS.BATTING.AB_MULTIPLIER;
    return isPlayoffs
      ? Math.max(base, QUALIFICATION_THRESHOLDS.BATTING.PLAYOFF_MINIMUM_AB)
      : base;
  }, [avgTeamGP, isPlayoffs]);

  const pitchingThreshold = useMemo(() => {
    const base = avgTeamGP * QUALIFICATION_THRESHOLDS.PITCHING.IP_MULTIPLIER;
    return isPlayoffs
      ? Math.max(base, QUALIFICATION_THRESHOLDS.PITCHING.PLAYOFF_MINIMUM_IP)
      : base;
  }, [avgTeamGP, isPlayoffs]);

  // Filter by category and search
  const hitters = useMemo(() =>
    filteredPlayers.filter(p => p.ab && p.ab > 0)
      .filter((player) => !qualifiedOnly || (player.ab ?? 0) >= battingThreshold),
    [filteredPlayers, qualifiedOnly, battingThreshold]
  );

  const pitchers = useMemo(() =>
    filteredPlayers.filter(p => p.ip && p.ip > 0)
      .filter((player) => !qualifiedOnly || (player.ip ?? 0) >= pitchingThreshold),
    [filteredPlayers, qualifiedOnly, pitchingThreshold]
  );

  const fielders = useMemo(() =>
    filteredPlayers.filter(p => (p.np && p.np > 0) || (p.e && p.e > 0) || (p.sb && p.sb > 0)),
    [filteredPlayers]
  );

  // Define hitting columns
  const hittingColumns: Column<PlayerStats>[] = [
    {
      key: 'name',
      label: 'Player',
      sortable: true,
      align: 'left',
      className: 'font-semibold text-star-white',
      render: (player) => (
        <Link
          href={`/players/${playerNameToSlug(player.name)}`}
          className="hover:text-nebula-cyan transition-colors underline decoration-nebula-cyan/30 hover:decoration-nebula-cyan"
        >
          {player.name}
        </Link>
      ),
    },
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (player) => (
        <span style={{ color: getTeamColor(player.team) }}>
          {player.team}
        </span>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    { key: 'ab', label: 'AB', align: 'center' },
    { key: 'h', label: 'H', align: 'center' },
    { key: 'hr', label: 'HR', align: 'center' },
    { key: 'rbi', label: 'RBI', align: 'center' },
    { key: 'dp', label: 'DP', align: 'center', condensed: true },
    { key: 'rob', label: 'ROB', align: 'center', condensed: true },
    { key: 'avg', label: 'AVG', align: 'center', className: 'text-nebula-cyan' },
    { key: 'obp', label: 'OBP', align: 'center', className: 'text-nebula-cyan', condensed: true },
    {
      key: 'slg',
      label: 'SLG',
      align: 'center',
      className: 'text-nebula-cyan',
      render: (player) => player.slg || '.000'
    },
    {
      key: 'ops',
      label: 'OPS',
      align: 'center',
      className: 'text-nebula-cyan',
      render: (player) => player.ops || '0.000'
    },
  ];

  // Define pitching columns
  const pitchingColumns: Column<PlayerStats>[] = [
    {
      key: 'name',
      label: 'Player',
      sortable: true,
      align: 'left',
      className: 'font-semibold text-star-white',
      render: (player) => (
        <Link
          href={`/players/${playerNameToSlug(player.name)}`}
          className="hover:text-nebula-cyan transition-colors underline decoration-nebula-cyan/30 hover:decoration-nebula-cyan"
        >
          {player.name}
        </Link>
      ),
    },
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (player) => (
        <span style={{ color: getTeamColor(player.team) }}>
          {player.team}
        </span>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    {
      key: 'ip',
      label: 'IP',
      align: 'center',
      render: (player) => player.ip?.toFixed(2) || '0.00'
    },
    { key: 'w', label: 'W', align: 'center', condensed: true },
    { key: 'l', label: 'L', align: 'center', condensed: true },
    { key: 'sv', label: 'SV', align: 'center', condensed: true },
    { key: 'hAllowed', label: 'H', align: 'center' },
    { key: 'hrAllowed', label: 'HR', align: 'center' },
    { key: 'era', label: 'ERA', align: 'center', className: 'font-bold text-nebula-teal' },
    { key: 'whip', label: 'WHIP', align: 'center', className: 'text-nebula-cyan' },
    { key: 'baa', label: 'BAA', align: 'center', className: 'text-nebula-cyan' },
  ];

  // Define fielding columns
  const fieldingColumns: Column<PlayerStats>[] = [
    {
      key: 'name',
      label: 'Player',
      sortable: true,
      align: 'left',
      className: 'font-semibold text-star-white',
      render: (player) => (
        <Link
          href={`/players/${playerNameToSlug(player.name)}`}
          className="hover:text-nebula-cyan transition-colors underline decoration-nebula-cyan/30 hover:decoration-nebula-cyan"
        >
          {player.name}
        </Link>
      ),
    },
    {
      key: 'team',
      label: 'Team',
      sortable: true,
      align: 'left',
      render: (player) => (
        <span style={{ color: getTeamColor(player.team) }}>
          {player.team}
        </span>
      ),
    },
    { key: 'gp', label: 'GP', align: 'center', className: 'text-star-gray' },
    { key: 'np', label: 'NP', align: 'center', className: 'font-bold text-solar-gold' },
    { key: 'e', label: 'E', align: 'center' },
    { key: 'sb', label: 'SB', align: 'center' },
    { key: 'cs', label: 'CS', align: 'center', className: 'text-nebula-cyan' },
  ];

  const highlightRow = spotlightPlayoffTeams
    ? (player: PlayerStats) => playoffEligibleTeams.includes(player.team)
    : undefined;

  return (
    <div className="space-y-8">
      <ControlShelf
        title="Data Controls"
        description="Filter by team, lock in qualified leaders, or spotlight playoff rosters."
      >
        <div className="flex flex-wrap gap-3 items-stretch w-full">
          <div className="flex items-center">
            <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
          </div>
          <nav className="flex flex-wrap gap-2 items-center" aria-label="Stat groups">
            {(['hitting', 'pitching', 'fielding'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="control-button"
                data-tone="orange"
                data-active={activeTab === tab}
                aria-pressed={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-3 items-stretch w-full">
          <div className="control-stack flex-1 min-w-[240px]">
            <label htmlFor="player-search" className="control-label">
              Search roster
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-star-gray" />
              </div>
              <input
                id="player-search"
                type="text"
                placeholder="Search players by name or team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="control-input w-full pl-9 pr-16"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 text-[10px] font-mono uppercase tracking-[0.3em] text-star-gray hover:text-star-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="control-stack w-full sm:w-auto">
            <span className="control-label">Team filter</span>
            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="control-input pr-10"
            >
              <option value="all">All teams</option>
              {teams.map((team) => (
                <option key={team.slug} value={team.slug}>
                  {team.shortName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQualifiedOnly((prev) => !prev)}
              aria-pressed={qualifiedOnly}
              className="control-button"
              data-tone="cyan"
              data-active={qualifiedOnly}
            >
              {qualifiedOnly ? 'Qualified only' : 'Show all players'}
            </button>
            <button
              type="button"
              onClick={() => setSpotlightPlayoffTeams((prev) => !prev)}
              aria-pressed={spotlightPlayoffTeams}
              className="control-button"
              data-tone="teal"
              data-active={spotlightPlayoffTeams}
            >
              {spotlightPlayoffTeams ? 'Playoff teams highlighted' : 'Highlight playoff teams'}
            </button>
          </div>
        </div>
        {qualifiedOnly && (
          <p className="text-[11px] font-mono text-star-gray/70">
            Batting ≥ {Math.round(battingThreshold)} AB • Pitching ≥ {pitchingThreshold.toFixed(1)} IP
          </p>
        )}
      </ControlShelf>

      {/* Hitting Table */}
      {activeTab === 'hitting' && (
        <DataTable
          columns={hittingColumns}
          data={hitters}
          getRowKey={(player) => `${player.name}-${player.team}`}
          defaultSortKey="ab"
          defaultSortDirection="desc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}

      {/* Pitching Table */}
      {activeTab === 'pitching' && (
        <DataTable
          columns={pitchingColumns}
          data={pitchers}
          getRowKey={(player) => `${player.name}-${player.team}`}
          defaultSortKey="ip"
          defaultSortDirection="desc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}

      {/* Fielding Table */}
      {activeTab === 'fielding' && (
        <DataTable
          columns={fieldingColumns}
          data={fielders}
          getRowKey={(player) => `${player.name}-${player.team}`}
          defaultSortKey="np"
          defaultSortDirection="desc"
          enableCondensed={true}
          highlightRow={highlightRow}
        />
      )}
    </div>
  );
}
