'use client';

import { useState } from 'react';
import { PlayerAttributes } from '@/lib/sheets';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import useLenisScrollLock from '@/hooks/useLenisScrollLock';
import LiveStatsIndicator from '@/components/LiveStatsIndicator';
import { RetroButton } from '@/components/ui/RetroButton';

type AttributeTab = 'hitting' | 'pitching' | 'fielding';

interface Props {
  players: PlayerAttributes[];
}

export default function AttributeComparisonView({ players }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AttributeTab>('hitting');

  const selectedPlayers = selectedPlayerNames
    .map(name => players.find(p => p.name === name))
    .filter((p): p is PlayerAttributes => p !== undefined);

  const playerNames = players.map(p => p.name).sort();

  const tableScrollRef = useLenisScrollLock<HTMLDivElement>();

  const panelClass =
    'relative rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.45)]';

  return (
    <div className="space-y-6">
      <div className={`${panelClass} p-6 lg:p-8`}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 25%, #b57cff 0%, transparent 45%)' }} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/10 text-[11px] font-mono uppercase tracking-[0.2em] text-white/70">Tool</span>
            <h1 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight text-shadow-neon">
              <span className="bg-gradient-to-r from-cosmic-purple via-royal-purple to-nebula-cyan bg-clip-text text-transparent">Attribute Comparator</span>
            </h1>
          </div>
          <p className="text-white/70 font-mono text-sm lg:text-base">Compare 2-5 players side-by-side across all 30 attributes.</p>
          <LiveStatsIndicator />
        </div>
      </div>

      {/* Attribute Category Tabs */}
      <div className={`${panelClass} p-4 flex flex-wrap gap-3`}>
        <RetroButton
          onClick={() => setActiveTab('hitting')}
          variant={activeTab === 'hitting' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Hitting
        </RetroButton>
        <RetroButton
          onClick={() => setActiveTab('pitching')}
          variant={activeTab === 'pitching' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Pitching
        </RetroButton>
        <RetroButton
          onClick={() => setActiveTab('fielding')}
          variant={activeTab === 'fielding' ? 'primary' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Fielding & Running
        </RetroButton>
      </div>

      {/* Player Selection */}
      <div className={`${panelClass} p-4 lg:p-6`}>
        <PlayerMultiSelect
          className="mb-2"
          players={playerNames}
          selectedPlayers={selectedPlayerNames}
          onSelectionChange={setSelectedPlayerNames}
          maxSelections={5}
          placeholder="Search players..."
        />
        <p className="text-white/60 font-mono text-xs uppercase tracking-[0.14em]">Select at least 2 players to view the retro comparison table.</p>
      </div>

      {/* Comparison Table */}
      {selectedPlayers.length >= 2 && (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="bg-gradient-to-r from-nebula-orange/20 via-cosmic-purple/15 to-nebula-cyan/20 h-1" />
          <div
            ref={tableScrollRef}
            className="relative overflow-auto max-h-[70vh]"
            onWheel={(e) => e.stopPropagation()}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/60">
                  <th className="px-4 py-3 text-left font-display font-black text-nebula-orange uppercase tracking-[0.18em] sticky left-0 bg-black/80 backdrop-blur-md z-10 border-r border-white/10">
                    Attribute
                  </th>
                  {selectedPlayers.map(player => (
                    <th
                      key={player.name}
                      className="px-4 py-3 text-center font-display font-semibold text-star-white min-w-[140px] uppercase tracking-[0.14em]"
                    >
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {/* Character Info Section */}
                <tr className="bg-gradient-to-r from-nebula-orange/20 to-nebula-coral/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-nebula-orange text-shadow">
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
                <tr className="bg-gradient-to-r from-solar-gold/20 to-comet-yellow/20">
                  <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-solar-gold text-shadow">
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
                    <tr className="bg-gradient-to-r from-solar-gold/20 to-comet-yellow/20">
                      <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-solar-gold text-shadow">
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
                    <tr className="bg-gradient-to-r from-nebula-coral/20 to-star-pink/20">
                      <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-nebula-coral text-shadow">
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
                    <tr className="bg-gradient-to-r from-field-green/20 to-nebula-teal/20">
                      <td colSpan={selectedPlayers.length + 1} className="px-4 py-2 font-display font-bold text-field-green text-shadow">
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
        </div>
      )}
    </div>
  );
}

interface AttributeRowProps {
  label: string;
  players: PlayerAttributes[];
  getValue: (player: PlayerAttributes) => string | number;
  numeric?: boolean;
  highlight?: boolean;
}

function AttributeRow({ label, players, getValue, numeric = false, highlight = false }: AttributeRowProps) {
  const values = players.map(p => getValue(p));

  // Find max value for numeric highlighting
  const maxValue = numeric ? Math.max(...values.map(v => typeof v === 'number' ? v : 0)) : null;

  return (
    <tr className="border-b border-cosmic-border hover:bg-space-blue/20 transition-colors duration-200">
      <td className={`px-4 py-2 font-medium text-star-gray sticky left-0 bg-space-navy/90 backdrop-blur-md border-r border-cosmic-border ${highlight ? 'font-bold text-star-white' : ''}`}>
        {label}
      </td>
      {players.map((player, idx) => {
        const value = getValue(player);
        const isMax = numeric && maxValue !== null && value === maxValue && value > 0;

        return (
          <td
            key={player.name}
            className={`px-4 py-2 text-center ${
              isMax ? 'bg-green-400/20 font-bold text-green-400' : 'text-star-white'
            } ${highlight ? 'font-semibold text-nebula-orange' : ''}`}
          >
            {value || '-'}
          </td>
        );
      })}
    </tr>
  );
}
