'use client';

import { useMemo, useState } from 'react';
import PlayerMultiSelect from '@/components/PlayerMultiSelect';
import RetroButton from '@/components/ui/RetroButton';
import { PlayerAttributes } from '@/lib/sheets';
import useLenisScrollLock from '@/hooks/useLenisScrollLock';

type AttributeTab = 'hitting' | 'pitching' | 'fielding';

type Props = {
  players: PlayerAttributes[];
};

export default function AttributeComparisonView({ players }: Props) {
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<AttributeTab>('hitting');

  const selectedPlayers = useMemo(
    () =>
      selectedPlayerNames
        .map((name) => players.find((p) => p.name === name))
        .filter((p): p is PlayerAttributes => p !== undefined),
    [selectedPlayerNames, players]
  );

  const playerNames = useMemo(() => players.map((p) => p.name).sort(), [players]);
  const tableScrollRef = useLenisScrollLock<HTMLDivElement>();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-black/60 via-surface-dark/80 to-black/60 p-6 shadow-[0_0_24px_rgba(0,243,255,0.12)]">
        <p className="font-mono text-sm uppercase text-white/60">Tools / Attributes</p>
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">
          Player Attribute Comparison
        </h1>
        <p className="text-white/70 font-mono text-base">
          Compare 2-5 players side-by-side across all 30 attributes with the retro kit styling.
        </p>
      </header>

      <div className="flex gap-3 flex-wrap">
        <RetroButton
          size="sm"
          variant={activeTab === 'hitting' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('hitting')}
        >
          Hitting
        </RetroButton>
        <RetroButton
          size="sm"
          variant={activeTab === 'pitching' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('pitching')}
        >
          Pitching
        </RetroButton>
        <RetroButton
          size="sm"
          variant={activeTab === 'fielding' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('fielding')}
        >
          Fielding & Running
        </RetroButton>
      </div>

      <PlayerMultiSelect
        className="mb-2"
        players={playerNames}
        selectedPlayers={selectedPlayerNames}
        onSelectionChange={setSelectedPlayerNames}
        maxSelections={5}
        placeholder="Search players..."
      />

      {selectedPlayers.length >= 2 && (
        <div className="rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] overflow-hidden">
          <div className="bg-gradient-to-r from-comets-cyan/15 via-comets-purple/10 to-comets-red/15 px-4 py-3 border-b border-white/10">
            <h2 className="text-lg font-display font-semibold text-white">Attribute Grid</h2>
          </div>
          <div ref={tableScrollRef} className="relative overflow-auto max-h-[70vh]" onWheel={(e) => e.stopPropagation()}>
            <table className="w-full text-sm text-white/80">
              <thead>
                <tr className="bg-black/40 border-b border-white/10">
                  <th className="px-4 py-3 text-left font-display font-bold text-comets-yellow sticky left-0 bg-surface-dark/95 backdrop-blur z-10 border-r border-white/10">
                    Attribute
                  </th>
                  {selectedPlayers.map((player) => (
                    <th
                      key={player.name}
                      className="px-4 py-3 text-center font-display font-bold text-white min-w-[120px]"
                    >
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                <AttributeSection label="Character Info" accent="from-comets-yellow/15 to-comets-red/10" span={selectedPlayers.length + 1} />
                <AttributeRow label="Class" players={selectedPlayers} getValue={(p) => p.characterClass} />
                <AttributeRow label="Captain" players={selectedPlayers} getValue={(p) => p.captain} />
                <AttributeRow label="Mii" players={selectedPlayers} getValue={(p) => p.mii} />
                <AttributeRow label="Mii Color" players={selectedPlayers} getValue={(p) => p.miiColor} />
                <AttributeRow label="Batting Side" players={selectedPlayers} getValue={(p) => p.battingSide} />
                <AttributeRow label="Arm Side" players={selectedPlayers} getValue={(p) => p.armSide} />
                <AttributeRow label="Weight" players={selectedPlayers} getValue={(p) => p.weight} />
                <AttributeRow label="Ability" players={selectedPlayers} getValue={(p) => p.ability} />

                <AttributeSection label="Overall" accent="from-comets-cyan/15 to-comets-purple/10" span={selectedPlayers.length + 1} />
                <AttributeRow label="Pitching Overall" players={selectedPlayers} getValue={(p) => p.pitchingOverall} numeric />
                <AttributeRow label="Batting Overall" players={selectedPlayers} getValue={(p) => p.battingOverall} numeric />
                <AttributeRow label="Fielding Overall" players={selectedPlayers} getValue={(p) => p.fieldingOverall} numeric />
                <AttributeRow label="Speed Overall" players={selectedPlayers} getValue={(p) => p.speedOverall} numeric />

                {activeTab === 'pitching' && (
                  <>
                    <AttributeSection label="Pitching Attributes" accent="from-comets-yellow/15 to-comets-red/10" span={selectedPlayers.length + 1} />
                    <AttributeRow label="Star Pitch" players={selectedPlayers} getValue={(p) => p.starPitch} />
                    <AttributeRow label="Fastball Speed" players={selectedPlayers} getValue={(p) => p.fastballSpeed} numeric />
                    <AttributeRow label="Curveball Speed" players={selectedPlayers} getValue={(p) => p.curveballSpeed} numeric />
                    <AttributeRow label="Curve" players={selectedPlayers} getValue={(p) => p.curve} numeric />
                    <AttributeRow label="Stamina" players={selectedPlayers} getValue={(p) => p.stamina} numeric />
                  </>
                )}

                {activeTab === 'hitting' && (
                  <>
                    <AttributeSection label="Hitting Attributes" accent="from-comets-cyan/15 to-comets-purple/10" span={selectedPlayers.length + 1} />
                    <AttributeRow label="Star Swing" players={selectedPlayers} getValue={(p) => p.starSwing} />
                    <AttributeRow label="Hit Curve" players={selectedPlayers} getValue={(p) => p.hitCurve} numeric />
                    <AttributeRow label="Hitting Trajectory" players={selectedPlayers} getValue={(p) => p.hittingTrajectory} />
                    <AttributeRow label="Slap Hit Contact" players={selectedPlayers} getValue={(p) => p.slapHitContact} numeric />
                    <AttributeRow label="Charge Hit Contact" players={selectedPlayers} getValue={(p) => p.chargeHitContact} numeric />
                    <AttributeRow label="Slap Hit Power" players={selectedPlayers} getValue={(p) => p.slapHitPower} numeric />
                    <AttributeRow label="Charge Hit Power" players={selectedPlayers} getValue={(p) => p.chargeHitPower} numeric />
                    <AttributeRow label="Pre-Charge" players={selectedPlayers} getValue={(p) => p.preCharge} />
                  </>
                )}

                {activeTab === 'fielding' && (
                  <>
                    <AttributeSection label="Fielding & Running" accent="from-emerald-400/15 to-comets-cyan/10" span={selectedPlayers.length + 1} />
                    <AttributeRow label="Fielding" players={selectedPlayers} getValue={(p) => p.fielding} numeric />
                    <AttributeRow label="Throwing Speed" players={selectedPlayers} getValue={(p) => p.throwingSpeed} numeric />
                    <AttributeRow label="Speed" players={selectedPlayers} getValue={(p) => p.speed} numeric />
                    <AttributeRow label="Bunting" players={selectedPlayers} getValue={(p) => p.bunting} numeric />
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

type AttributeRowProps = {
  label: string;
  players: PlayerAttributes[];
  getValue: (player: PlayerAttributes) => any;
  numeric?: boolean;
};

function AttributeRow({ label, players, getValue, numeric }: AttributeRowProps) {
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3 text-left text-white/80 font-semibold sticky left-0 bg-surface-dark/95 backdrop-blur z-10 border-r border-white/10">
        {label}
      </td>
      {players.map((player) => {
        const value = getValue(player);
        return (
          <td
            key={player.name}
            className="px-4 py-3 text-center text-white"
          >
            {numeric && typeof value === 'number' ? value.toFixed(0) : value ?? '-'}
          </td>
        );
      })}
    </tr>
  );
}

function AttributeSection({ label, accent, span }: { label: string; accent: string; span: number }) {
  return (
    <tr className={`bg-gradient-to-r ${accent}`}>
      <td colSpan={span} className="px-4 py-2 text-left font-display font-bold text-white text-shadow">
        {label}
      </td>
    </tr>
  );
}
