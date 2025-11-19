'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlayerStats } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import SeasonToggle from '@/components/SeasonToggle';
import DataTable, { Column } from '@/components/DataTable';
import { Search } from 'lucide-react';
import { playerNameToSlug } from '@/lib/utils';
import StatTooltip from '@/components/StatTooltip';

type Tab = 'hitting' | 'pitching' | 'fielding';

interface PlayersViewProps {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function PlayersView({
  regularPlayers,
  playoffPlayers
}: PlayersViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('hitting');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!searchQuery.trim()) return players;

    const query = searchQuery.toLowerCase();
    return players.filter(player =>
      player.name.toLowerCase().includes(query) ||
      player.team.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  // Filter by category and search
  const hitters = useMemo(() =>
    filteredPlayers.filter(p => p.ab && p.ab > 0),
    [filteredPlayers]
  );

  const pitchers = useMemo(() =>
    filteredPlayers.filter(p => p.ip && p.ip > 0),
    [filteredPlayers]
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
          className="hover:text-nebula-orange transition-colors"
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
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    { key: 'ab', label: <StatTooltip stat="AB">AB</StatTooltip>, align: 'center' },
    { key: 'h', label: <StatTooltip stat="H">H</StatTooltip>, align: 'center' },
    { key: 'hr', label: <StatTooltip stat="HR">HR</StatTooltip>, align: 'center' },
    { key: 'rbi', label: <StatTooltip stat="RBI">RBI</StatTooltip>, align: 'center' },
    { key: 'dp', label: 'DP', align: 'center', condensed: true },
    { key: 'rob', label: <StatTooltip stat="ROB">ROB</StatTooltip>, align: 'center', condensed: true },
    { key: 'avg', label: <StatTooltip stat="AVG">AVG</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
    { key: 'obp', label: <StatTooltip stat="OBP">OBP</StatTooltip>, align: 'center', className: 'text-nebula-cyan', condensed: true },
    {
      key: 'slg',
      label: <StatTooltip stat="SLG">SLG</StatTooltip>,
      align: 'center',
      className: 'text-nebula-cyan',
      render: (player) => player.slg || '.000'
    },
    {
      key: 'ops',
      label: <StatTooltip stat="OPS">OPS</StatTooltip>,
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
          className="hover:text-nebula-orange transition-colors"
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
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    {
      key: 'ip',
      label: <StatTooltip stat="IP">IP</StatTooltip>,
      align: 'center',
      render: (player) => player.ip?.toFixed(2) || '0.00'
    },
    { key: 'w', label: <StatTooltip stat="W">W</StatTooltip>, align: 'center', condensed: true },
    { key: 'l', label: <StatTooltip stat="L">L</StatTooltip>, align: 'center', condensed: true },
    { key: 'sv', label: <StatTooltip stat="SV">SV</StatTooltip>, align: 'center', condensed: true },
    { key: 'hAllowed', label: <StatTooltip stat="H">H</StatTooltip>, align: 'center' },
    { key: 'hrAllowed', label: <StatTooltip stat="HR">HR</StatTooltip>, align: 'center' },
    { key: 'era', label: <StatTooltip stat="ERA">ERA</StatTooltip>, align: 'center', className: 'font-bold text-nebula-teal' },
    { key: 'whip', label: <StatTooltip stat="WHIP">WHIP</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
    { key: 'baa', label: <StatTooltip stat="BAA">BAA</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
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
          className="hover:text-nebula-orange transition-colors"
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
    { key: 'gp', label: <StatTooltip stat="GP">GP</StatTooltip>, align: 'center', className: 'text-star-gray' },
    { key: 'np', label: <StatTooltip stat="NP">NP</StatTooltip>, align: 'center', className: 'font-bold text-solar-gold' },
    { key: 'e', label: <StatTooltip stat="E">E</StatTooltip>, align: 'center' },
    { key: 'sb', label: <StatTooltip stat="SB">SB</StatTooltip>, align: 'center' },
    { key: 'cs', label: <StatTooltip stat="CS">CS</StatTooltip>, align: 'center', className: 'text-nebula-cyan' },
  ];

  // Don't render until we have data
  if (!regularPlayers || !playoffPlayers || regularPlayers.length === 0) {
    return (
      <div className="glass-card py-16 px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-nebula-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-star-gray font-mono animate-pulse">Loading player statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Season Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" /> {/* Spacer */}
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('hitting')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'hitting'
                ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Hitting
          </button>
          <button
            onClick={() => setActiveTab('pitching')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'pitching'
                ? 'bg-gradient-to-r from-solar-gold to-comet-yellow text-space-black shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Pitching
          </button>
          <button
            onClick={() => setActiveTab('fielding')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'fielding'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Fielding
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-star-gray" />
          </div>
          <input
            type="text"
            placeholder="Search players by name or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-space-blue/30 border border-cosmic-border rounded-lg font-mono text-sm text-star-white placeholder-star-gray/50 focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-star-gray hover:text-star-white transition-colors"
            >
              <span className="text-sm">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Hitting Table */}
      {activeTab === 'hitting' && (
        <DataTable
          columns={hittingColumns}
          data={hitters}
          getRowKey={(player) => `${player.name}-${player.team}`}
          defaultSortKey="ab"
          defaultSortDirection="desc"
          enableCondensed={true}
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
        />
      )}
    </div>
  );
}
