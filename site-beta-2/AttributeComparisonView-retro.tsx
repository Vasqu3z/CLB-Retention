'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAttributes } from '@/lib/sheets';
import { Activity, Zap, Shield, TrendingUp, X } from 'lucide-react';

type AttributeTab = 'hitting' | 'pitching' | 'fielding';

interface Props {
  players: PlayerAttributes[];
}

export default function AttributeComparisonView({ players }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AttributeTab>('hitting');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedPlayers = selectedPlayerNames
    .map(name => players.find(p => p.name === name))
    .filter((p): p is PlayerAttributes => p !== undefined);

  const filteredPlayers = players.filter(p => 
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
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-arcade-purple/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-arcade-cyan/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-arcade-purple via-arcade-cyan to-arcade-blue rounded-full opacity-60" />
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-arcade-purple via-arcade-cyan to-arcade-blue bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(189,0,255,0.5)]">
            ATTRIBUTE COMPARISON
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-ui tracking-wide">
          COMPARE PLAYERS • ALL 30 ATTRIBUTES
        </p>
      </div>

      {/* Attribute Category Tabs */}
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
                Select Players (2-5)
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
                  placeholder="Search players..."
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
                {selectedPlayerNames.map((name, idx) => (
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

      {/* Comparison Table */}
      {selectedPlayers.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl overflow-hidden"
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
          
          <div className="relative overflow-auto max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gradient-to-r from-arcade-cyan/20 to-arcade-purple/20 border-b-2 border-arcade-cyan/50">
                  <th className="px-6 py-4 text-left font-display font-bold text-arcade-cyan uppercase tracking-wider sticky left-0 bg-black/90 backdrop-blur-md z-10 border-r-2 border-arcade-cyan/30">
                    Attribute
                  </th>
                  {selectedPlayers.map((player, idx) => (
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
                {/* Character Info Section */}
                <tr className="bg-gradient-to-r from-arcade-cyan/10 to-arcade-purple/10">
                  <td colSpan={selectedPlayers.length + 1} className="px-6 py-3 font-display font-bold text-arcade-cyan uppercase tracking-wider">
                    Character Info
                  </td>
                </tr>
                <AttributeRow label="Class" players={selectedPlayers} getValue={p => p.characterClass} />
                <AttributeRow label="Captain" players={selectedPlayers} getValue={p => p.captain} />
                <AttributeRow label="Mii" players={selectedPlayers} getValue={p => p.mii} />
                <AttributeRow label="Mii Color" players={selectedPlayers} getValue={p => p.miiColor} />
                <AttributeRow label="Batting Side" players={selectedPlayers} getValue={p => p.battingSide} />
                <AttributeRow label="Arm Side" players={selectedPlayers} getValue={p => p.armSide} />
                <AttributeRow label="Weight" players={selectedPlayers} getValue={p => p.weight} />
                <AttributeRow label="Ability" players={selectedPlayers} getValue={p => p.ability} />

                {/* Overall Stats Section */}
                <tr className="bg-gradient-to-r from-arcade-yellow/10 to-arcade-red/10">
                  <td colSpan={selectedPlayers.length + 1} className="px-6 py-3 font-display font-bold text-arcade-yellow uppercase tracking-wider">
                    Overall Stats
                  </td>
                </tr>
                <AttributeRow label="Pitching Overall" players={selectedPlayers} getValue={p => p.pitchingOverall} numeric />
                <AttributeRow label="Batting Overall" players={selectedPlayers} getValue={p => p.battingOverall} numeric />
                <AttributeRow label="Fielding Overall" players={selectedPlayers} getValue={p => p.fieldingOverall} numeric />
                <AttributeRow label="Speed Overall" players={selectedPlayers} getValue={p => p.speedOverall} numeric />

                {/* Pitching Attributes Section */}
                {activeTab === 'pitching' && (
                  <>
                    <tr className="bg-gradient-to-r from-arcade-yellow/10 to-arcade-red/10">
                      <td colSpan={selectedPlayers.length + 1} className="px-6 py-3 font-display font-bold text-arcade-yellow uppercase tracking-wider">
                        Pitching Attributes
                      </td>
                    </tr>
                    <AttributeRow label="Star Pitch" players={selectedPlayers} getValue={p => p.starPitch} />
                    <AttributeRow label="Fastball Speed" players={selectedPlayers} getValue={p => p.fastballSpeed} numeric />
                    <AttributeRow label="Curveball Speed" players={selectedPlayers} getValue={p => p.curveballSpeed} numeric />
                    <AttributeRow label="Curve" players={selectedPlayers} getValue={p => p.curve} numeric />
                    <AttributeRow label="Stamina" players={selectedPlayers} getValue={p => p.stamina} numeric />
                  </>
                )}

                {/* Hitting Attributes Section */}
                {activeTab === 'hitting' && (
                  <>
                    <tr className="bg-gradient-to-r from-arcade-red/10 to-arcade-purple/10">
                      <td colSpan={selectedPlayers.length + 1} className="px-6 py-3 font-display font-bold text-arcade-red uppercase tracking-wider">
                        Hitting Attributes
                      </td>
                    </tr>
                    <AttributeRow label="Star Swing" players={selectedPlayers} getValue={p => p.starSwing} />
                    <AttributeRow label="Hit Curve" players={selectedPlayers} getValue={p => p.hitCurve} numeric />
                    <AttributeRow label="Hitting Trajectory" players={selectedPlayers} getValue={p => p.hittingTrajectory} />
                    <AttributeRow label="Slap Hit Contact" players={selectedPlayers} getValue={p => p.slapHitContact} numeric />
                    <AttributeRow label="Charge Hit Contact" players={selectedPlayers} getValue={p => p.chargeHitContact} numeric />
                    <AttributeRow label="Slap Hit Power" players={selectedPlayers} getValue={p => p.slapHitPower} numeric />
                    <AttributeRow label="Charge Hit Power" players={selectedPlayers} getValue={p => p.chargeHitPower} numeric />
                    <AttributeRow label="Pre-Charge" players={selectedPlayers} getValue={p => p.preCharge} />
                  </>
                )}

                {/* Fielding & Running Section */}
                {activeTab === 'fielding' && (
                  <>
                    <tr className="bg-gradient-to-r from-arcade-cyan/10 to-arcade-blue/10">
                      <td colSpan={selectedPlayers.length + 1} className="px-6 py-3 font-display font-bold text-arcade-cyan uppercase tracking-wider">
                        Fielding & Running
                      </td>
                    </tr>
                    <AttributeRow label="Fielding" players={selectedPlayers} getValue={p => p.fielding} numeric />
                    <AttributeRow label="Throwing Speed" players={selectedPlayers} getValue={p => p.throwingSpeed} numeric />
                    <AttributeRow label="Speed" players={selectedPlayers} getValue={p => p.speed} numeric />
                    <AttributeRow label="Bunting" players={selectedPlayers} getValue={p => p.bunting} numeric />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {selectedPlayers.length < 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-xl p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
          <div className="relative">
            <Activity className="w-16 h-16 mx-auto mb-4 text-arcade-purple opacity-40" />
            <p className="text-xl font-display font-bold text-white mb-2">SELECT AT LEAST 2 PLAYERS</p>
            <p className="text-white/60 font-ui">Start typing to search and compare player attributes</p>
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

interface AttributeRowProps {
  label: string;
  players: PlayerAttributes[];
  getValue: (player: PlayerAttributes) => string | number;
  numeric?: boolean;
}

function AttributeRow({ label, players, getValue, numeric = false }: AttributeRowProps) {
  const values = players.map(p => getValue(p));
  const maxValue = numeric ? Math.max(...values.map(v => typeof v === 'number' ? v : 0)) : null;

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
      <td className="px-6 py-4 font-ui font-medium text-white/80 sticky left-0 bg-black/90 backdrop-blur-md border-r border-white/10">
        {label}
      </td>
      {players.map((player) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && value > 0;

        return (
          <td
            key={player.name}
            className={`
              px-6 py-4 text-center font-mono
              ${isMax 
                ? 'bg-arcade-cyan/20 font-bold text-arcade-cyan border-l-2 border-r-2 border-arcade-cyan/50' 
                : 'text-white'
              }
            `}
          >
            {value || '-'}
          </td>
        );
      })}
    </tr>
  );
}
