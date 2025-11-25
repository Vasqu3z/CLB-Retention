'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerStats } from '@/lib/sheets';
import { TrendingUp, Zap, Shield, X } from 'lucide-react';

type StatTab = 'hitting' | 'pitching' | 'fielding';

interface Props {
  regularPlayers: PlayerStats[];
  playoffPlayers: PlayerStats[];
}

export default function StatsComparisonView({ regularPlayers, playoffPlayers }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<StatTab>('hitting');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const activePlayers = isPlayoffs ? playoffPlayers : regularPlayers;

  const selectedPlayers = selectedPlayerNames
    .map(name => activePlayers.find(p => p.name === name))
    .filter((p): p is PlayerStats => p !== undefined);

  const availablePlayerNames = activePlayers.map(p => p.name).sort();
  const filteredPlayers = activePlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedPlayerNames.includes(p.name)
  );

  const addPlayer = (name: string) => {
    if (selectedPlayerNames.length < 5) {
      setSelectedPlayerNames([...selectedPlayerNames, name]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const removePlayer = (name: string) => {
    setSelectedPlayerNames(selectedPlayerNames.filter(n => n !== name));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-arcade-cyan/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-arcade-yellow/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-arcade-cyan via-arcade-yellow to-arcade-red rounded-full opacity-60" />
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-arcade-cyan via-arcade-yellow to-arcade-red bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(0,243,255,0.5)]">
            STATS COMPARISON
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-ui tracking-wide">
          COMPARE PLAYERS • HITTING, PITCHING, FIELDING
        </p>
      </div>

      {/* Season Toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative"
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1 w-fit">
          <button
            onClick={() => setIsPlayoffs(false)}
            className={`
              relative px-6 py-2.5 rounded-md font-ui font-bold text-sm tracking-wider transition-all duration-300
              ${!isPlayoffs 
                ? 'bg-arcade-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.6)]' 
                : 'text-white/60 hover:text-white/90'
              }
            `}
          >
            {!isPlayoffs && (
              <motion.div
                layoutId="stats-season-indicator"
                className="absolute inset-0 bg-arcade-cyan rounded-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">REGULAR SEASON</span>
          </button>
          <button
            onClick={() => setIsPlayoffs(true)}
            className={`
              relative px-6 py-2.5 rounded-md font-ui font-bold text-sm tracking-wider transition-all duration-300
              ${isPlayoffs 
                ? 'bg-arcade-yellow text-black shadow-[0_0_20px_rgba(244,208,63,0.6)]' 
                : 'text-white/60 hover:text-white/90'
              }
            `}
          >
            {isPlayoffs && (
              <motion.div
                layoutId="stats-season-indicator"
                className="absolute inset-0 bg-arcade-yellow rounded-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">PLAYOFFS</span>
          </button>
        </div>
      </motion.div>

      {/* Stat Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gradient-to-r from-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-xl">
          <TabButton
            active={activeTab === 'hitting'}
            onClick={() => setActiveTab('hitting')}
            label="HITTING"
            icon={<TrendingUp className="w-4 h-4" />}
            color="from-arcade-red to-arcade-red/80"
          />
          <TabButton
            active={activeTab === 'pitching'}
            onClick={() => setActiveTab('pitching')}
            label="PITCHING"
            icon={<Zap className="w-4 h-4" />}
            color="from-arcade-yellow to-arcade-yellow/80"
          />
          <TabButton
            active={activeTab === 'fielding'}
            onClick={() => setActiveTab('fielding')}
            label="FIELDING & RUNNING"
            icon={<Shield className="w-4 h-4" />}
            color="from-arcade-cyan to-arcade-blue"
          />
        </div>
      </motion.div>

      {/* Player Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl p-6 overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
          
          <div className="relative space-y-4">
            <label className="block">
              <span className="text-sm font-ui font-bold text-arcade-cyan uppercase tracking-wider mb-2 block">
                Select Players (2-5) • {isPlayoffs ? 'Playoffs' : 'Regular Season'}
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={`Search ${isPlayoffs ? 'playoff' : 'regular season'} players...`}
                  disabled={selectedPlayerNames.length >= 5}
                  className="
                    w-full px-4 py-3 
                    bg-black/40 border-2 border-white/20 
                    focus:border-arcade-cyan focus:shadow-[0_0_20px_rgba(0,243,255,0.3)]
                    rounded-lg font-ui text-white placeholder-white/40
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                
                {/* Search Dropdown */}
                <AnimatePresence>
                  {showDropdown && searchQuery && filteredPlayers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="
                        absolute z-50 w-full mt-2
                        bg-black/95 backdrop-blur-xl border-2 border-arcade-cyan/50
                        rounded-lg shadow-[0_0_30px_rgba(0,243,255,0.3)]
                        max-h-60 overflow-y-auto
                      "
                    >
                      {filteredPlayers.slice(0, 10).map((player) => (
                        <button
                          key={player.name}
                          onClick={() => addPlayer(player.name)}
                          className="
                            w-full px-4 py-3 text-left font-ui text-white
                            hover:bg-arcade-cyan/20 hover:text-arcade-cyan
                            border-b border-white/10 last:border-0
                            transition-colors duration-200
                          "
                        >
                          {player.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </label>

            {/* Selected Players Pills */}
            {selectedPlayerNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPlayerNames.map((name) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="
                      flex items-center gap-2 px-4 py-2
                      bg-arcade-cyan/20 border border-arcade-cyan/50
                      text-arcade-cyan font-ui font-semibold text-sm
                      rounded-full
                    "
                  >
                    <span>{name}</span>
                    <button
                      onClick={() => removePlayer(name)}
                      className="hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Comparison Tables */}
      {selectedPlayers.length >= 2 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${isPlayoffs}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl overflow-hidden"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
            
            {/* Table Header */}
            <div className={`
              relative px-6 py-4 border-b-2
              ${activeTab === 'hitting' 
                ? 'bg-gradient-to-r from-arcade-red/20 to-arcade-purple/20 border-arcade-red/50' 
                : activeTab === 'pitching'
                ? 'bg-gradient-to-r from-arcade-yellow/20 to-arcade-red/20 border-arcade-yellow/50'
                : 'bg-gradient-to-r from-arcade-cyan/20 to-arcade-blue/20 border-arcade-cyan/50'
              }
            `}>
              <h3 className={`
                text-xl font-display font-bold uppercase tracking-wider
                ${activeTab === 'hitting' 
                  ? 'text-arcade-red' 
                  : activeTab === 'pitching'
                  ? 'text-arcade-yellow'
                  : 'text-arcade-cyan'
                }
              `}>
                {activeTab === 'hitting' && 'HITTING STATISTICS'}
                {activeTab === 'pitching' && 'PITCHING STATISTICS'}
                {activeTab === 'fielding' && 'FIELDING & RUNNING STATISTICS'}
              </h3>
            </div>

            {/* Table */}
            <div className="relative overflow-auto max-h-[70vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-20">
                  <tr className={`
                    border-b-2
                    ${activeTab === 'hitting' 
                      ? 'bg-arcade-red/10 border-arcade-red/30' 
                      : activeTab === 'pitching'
                      ? 'bg-arcade-yellow/10 border-arcade-yellow/30'
                      : 'bg-arcade-cyan/10 border-arcade-cyan/30'
                    }
                  `}>
                    <th className={`
                      px-6 py-4 text-left font-display font-bold uppercase tracking-wider
                      sticky left-0 bg-black/90 backdrop-blur-md z-10 border-r-2
                      ${activeTab === 'hitting' 
                        ? 'text-arcade-red border-arcade-red/30' 
                        : activeTab === 'pitching'
                        ? 'text-arcade-yellow border-arcade-yellow/30'
                        : 'text-arcade-cyan border-arcade-cyan/30'
                      }
                    `}>
                      Stat
                    </th>
                    {selectedPlayers.map((player) => (
                      <th
                        key={player.name}
                        className="px-6 py-4 text-center font-display font-bold text-white uppercase tracking-wide min-w-[140px]"
                      >
                        {player.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {/* Hitting Stats */}
                  {activeTab === 'hitting' && (
                    <>
                      <StatRow label="GP" players={selectedPlayers} getValue={p => p.gp} numeric />
                      <StatRow label="AB" players={selectedPlayers} getValue={p => p.ab} numeric />
                      <StatRow label="H" players={selectedPlayers} getValue={p => p.h} numeric />
                      <StatRow label="HR" players={selectedPlayers} getValue={p => p.hr} numeric />
                      <StatRow label="RBI" players={selectedPlayers} getValue={p => p.rbi} numeric />
                      <StatRow label="ROB" players={selectedPlayers} getValue={p => p.rob} numeric />
                      <StatRow label="DP" players={selectedPlayers} getValue={p => p.dp} numeric />
                      <StatRow label="AVG" players={selectedPlayers} getValue={p => p.avg} highlight />
                      <StatRow label="OBP" players={selectedPlayers} getValue={p => p.obp} highlight />
                      <StatRow label="SLG" players={selectedPlayers} getValue={p => p.slg} highlight />
                      <StatRow label="OPS" players={selectedPlayers} getValue={p => p.ops} highlight />
                    </>
                  )}

                  {/* Pitching Stats */}
                  {activeTab === 'pitching' && (
                    <>
                      <StatRow label="IP" players={selectedPlayers} getValue={p => p.ip} numeric />
                      <StatRow label="W" players={selectedPlayers} getValue={p => p.w} numeric />
                      <StatRow label="L" players={selectedPlayers} getValue={p => p.l} numeric />
                      <StatRow label="SV" players={selectedPlayers} getValue={p => p.sv} numeric />
                      <StatRow label="H" players={selectedPlayers} getValue={p => p.hAllowed} numeric />
                      <StatRow label="HR" players={selectedPlayers} getValue={p => p.hrAllowed} numeric />
                      <StatRow label="ERA" players={selectedPlayers} getValue={p => p.era} highlight />
                      <StatRow label="WHIP" players={selectedPlayers} getValue={p => p.whip} highlight />
                      <StatRow label="BAA" players={selectedPlayers} getValue={p => p.baa} highlight />
                    </>
                  )}

                  {/* Fielding Stats */}
                  {activeTab === 'fielding' && (
                    <>
                      <StatRow label="NP" players={selectedPlayers} getValue={p => p.np} numeric />
                      <StatRow label="E" players={selectedPlayers} getValue={p => p.e} numeric />
                      <StatRow label="OAA" players={selectedPlayers} getValue={p => p.oaa} numeric highlight />
                      <StatRow label="SB" players={selectedPlayers} getValue={p => p.sb} numeric />
                      <StatRow label="CS" players={selectedPlayers} getValue={p => p.cs} numeric />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        // Empty State
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
          <div className="relative">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-arcade-cyan opacity-40" />
            <p className="text-xl font-display font-bold text-white mb-2">SELECT AT LEAST 2 PLAYERS</p>
            <p className="text-white/60 font-ui">Start typing to search and compare player statistics</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function TabButton({ active, onClick, label, icon, color }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg
        font-ui font-bold text-sm tracking-wider transition-all duration-300
        ${active 
          ? `bg-gradient-to-r ${color} text-black shadow-[0_0_30px_rgba(0,243,255,0.4)]` 
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface StatRowProps {
  label: string;
  players: PlayerStats[];
  getValue: (player: PlayerStats) => string | number | undefined;
  numeric?: boolean;
  highlight?: boolean;
}

function StatRow({ label, players, getValue, numeric = false, highlight = false }: StatRowProps) {
  const values = players.map(p => getValue(p));
  const maxValue = numeric && !highlight
    ? Math.max(...values.map(v => typeof v === 'number' ? v : 0))
    : null;

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
      <td className={`
        px-6 py-4 font-ui font-medium sticky left-0 bg-black/90 backdrop-blur-md border-r border-white/10
        ${highlight ? 'font-bold text-white' : 'text-white/80'}
      `}>
        {label}
      </td>
      {players.map((player) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && (value as number) > 0;
        const displayValue = value !== undefined && value !== null && value !== 0 ? value : '-';

        return (
          <td
            key={player.name}
            className={`
              px-6 py-4 text-center font-mono
              ${isMax 
                ? 'bg-arcade-cyan/20 font-bold text-arcade-cyan border-l-2 border-r-2 border-arcade-cyan/50' 
                : highlight
                ? 'font-semibold text-arcade-yellow'
                : 'text-white'
              }
            `}
          >
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
}
