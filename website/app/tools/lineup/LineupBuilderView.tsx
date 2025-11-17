'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChemistryMatrix } from '@/lib/sheets';

interface Props {
  chemistryMatrix: ChemistryMatrix;
  playerNames: string[];
}

const POSITIVE_MIN = 100;
const NEGATIVE_MAX = -100;

const POSITIONS = [
  { id: 0, label: 'P', name: 'Pitcher', x: 50, y: 70 },
  { id: 1, label: 'C', name: 'Catcher', x: 50, y: 85 },
  { id: 2, label: '1B', name: 'First Base', x: 72, y: 72 },
  { id: 3, label: '2B', name: 'Second Base', x: 65, y: 50 },
  { id: 4, label: '3B', name: 'Third Base', x: 28, y: 72 },
  { id: 5, label: 'SS', name: 'Shortstop', x: 35, y: 50 },
  { id: 6, label: 'LF', name: 'Left Field', x: 15, y: 25 },
  { id: 7, label: 'CF', name: 'Center Field', x: 50, y: 15 },
  { id: 8, label: 'RF', name: 'Right Field', x: 85, y: 25 },
];

interface SavedLineup {
  name: string;
  players: (string | null)[];
  chemistry: number;
  timestamp: number;
}

export default function LineupBuilderView({ chemistryMatrix, playerNames }: Props) {
  const [lineup, setLineup] = useState<(string | null)[]>(Array(9).fill(null));
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [draggedFromPosition, setDraggedFromPosition] = useState<number | null>(null);
  const [saveLineupName, setSaveLineupName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Debug: Log playerNames to console
  useEffect(() => {
    console.log('Lineup Builder - Player count:', playerNames.length);
    console.log('Lineup Builder - Players:', playerNames);
  }, [playerNames]);

  // Load saved lineups from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clb-saved-lineups');
    if (saved) {
      try {
        setSavedLineups(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved lineups:', e);
      }
    }
  }, []);

  // Calculate total chemistry
  const totalChemistry = useMemo(() => {
    const players = lineup.filter((p): p is string => p !== null);
    let total = 0;

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];
        const value = chemistryMatrix[player1]?.[player2] || 0;
        total += value;
      }
    }

    return total;
  }, [lineup, chemistryMatrix]);

  // Get chemistry connections for visualization
  const chemistryConnections = useMemo(() => {
    const connections: Array<{
      pos1: number;
      pos2: number;
      value: number;
      type: 'positive' | 'negative' | 'neutral';
    }> = [];

    for (let i = 0; i < lineup.length; i++) {
      for (let j = i + 1; j < lineup.length; j++) {
        const player1 = lineup[i];
        const player2 = lineup[j];

        if (!player1 || !player2) continue;

        const value = chemistryMatrix[player1]?.[player2] || 0;

        if (value !== 0) {
          const type =
            value >= POSITIVE_MIN ? 'positive' : value <= NEGATIVE_MAX ? 'negative' : 'neutral';

          if (type !== 'neutral') {
            connections.push({ pos1: i, pos2: j, value, type });
          }
        }
      }
    }

    return connections;
  }, [lineup, chemistryMatrix]);

  // Get available players (not in lineup)
  const availablePlayers = playerNames.filter(name => !lineup.includes(name));

  // Drag handlers
  const handleDragStart = (player: string, fromPosition?: number) => {
    setDraggedPlayer(player);
    setDraggedFromPosition(fromPosition ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnPosition = (position: number) => {
    if (!draggedPlayer) return;

    const newLineup = [...lineup];

    // If dragging from another position, clear that position
    if (draggedFromPosition !== null) {
      newLineup[draggedFromPosition] = null;
    }

    // If position is occupied, move that player back to available
    newLineup[position] = draggedPlayer;

    setLineup(newLineup);
    setDraggedPlayer(null);
    setDraggedFromPosition(null);
  };

  const handleRemoveFromPosition = (position: number) => {
    const newLineup = [...lineup];
    newLineup[position] = null;
    setLineup(newLineup);
  };

  const handleClearLineup = () => {
    setLineup(Array(9).fill(null));
  };

  const handleSaveLineup = () => {
    if (!saveLineupName.trim()) return;

    const newSavedLineup: SavedLineup = {
      name: saveLineupName.trim(),
      players: [...lineup],
      chemistry: totalChemistry,
      timestamp: Date.now(),
    };

    const updatedLineups = [...savedLineups, newSavedLineup];
    setSavedLineups(updatedLineups);
    localStorage.setItem('clb-saved-lineups', JSON.stringify(updatedLineups));

    setSaveLineupName('');
    setShowSaveDialog(false);
  };

  const handleLoadLineup = (savedLineup: SavedLineup) => {
    setLineup([...savedLineup.players]);
  };

  const handleDeleteLineup = (index: number) => {
    const updatedLineups = savedLineups.filter((_, i) => i !== index);
    setSavedLineups(updatedLineups);
    localStorage.setItem('clb-saved-lineups', JSON.stringify(updatedLineups));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏟️ Lineup Builder
          </h1>
          <p className="text-gray-600">
            Drag and drop players to build your optimal lineup with chemistry visualization
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Baseball Field */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Chemistry Score */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Team Chemistry:
                    <span className={`ml-2 ${
                      totalChemistry > 0 ? 'text-green-600' : totalChemistry < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {totalChemistry > 0 ? '+' : ''}{totalChemistry}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600">
                    {lineup.filter(p => p !== null).length}/9 players placed
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    disabled={lineup.filter(p => p !== null).length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={handleClearLineup}
                    disabled={lineup.filter(p => p !== null).length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>

              {/* Baseball Field */}
              <div className="relative aspect-square bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-8">
                {/* Chemistry Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                  {chemistryConnections.map((conn, idx) => {
                    const pos1 = POSITIONS[conn.pos1];
                    const pos2 = POSITIONS[conn.pos2];
                    const color = conn.type === 'positive' ? '#22c55e' : '#ef4444';
                    const opacity = Math.min(Math.abs(conn.value) / 500, 0.8);

                    return (
                      <line
                        key={idx}
                        x1={`${pos1.x}%`}
                        y1={`${pos1.y}%`}
                        x2={`${pos2.x}%`}
                        y2={`${pos2.y}%`}
                        stroke={color}
                        strokeWidth="3"
                        opacity={opacity}
                        strokeDasharray={conn.type === 'positive' ? '0' : '5,5'}
                      />
                    );
                  })}
                </svg>

                {/* Player Positions */}
                {POSITIONS.map(position => {
                  const player = lineup[position.id];
                  const hasChemistry = chemistryConnections.some(
                    c => c.pos1 === position.id || c.pos2 === position.id
                  );

                  return (
                    <div
                      key={position.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${position.x}%`, top: `${position.y}%`, zIndex: 10 }}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnPosition(position.id)}
                    >
                      {player ? (
                        <div
                          draggable
                          onDragStart={() => handleDragStart(player, position.id)}
                          className={`
                            relative bg-white rounded-lg shadow-lg px-3 py-2 cursor-move
                            border-2 transition-all hover:scale-105
                            ${hasChemistry ? 'border-yellow-400 shadow-yellow-400/50' : 'border-gray-300'}
                          `}
                        >
                          <div className="text-xs font-bold text-gray-500 text-center mb-1">
                            {position.label}
                          </div>
                          <div className="text-sm font-bold text-gray-900 text-center whitespace-nowrap">
                            {player}
                          </div>
                          <button
                            onClick={() => handleRemoveFromPosition(position.id)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/50 px-4 py-3 text-center">
                          <div className="text-xs font-bold text-white">{position.label}</div>
                          <div className="text-xs text-white/70 mt-1">{position.name}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Players */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                Available Players ({availablePlayers.length})
              </h3>
              {availablePlayers.length > 0 ? (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {availablePlayers.map(player => (
                    <div
                      key={player}
                      draggable
                      onDragStart={() => handleDragStart(player)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded cursor-move text-sm font-medium text-gray-900 transition-colors"
                    >
                      {player}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  {playerNames.length === 0
                    ? 'No players available. Check console for errors.'
                    : 'All players are in the lineup'}
                </p>
              )}
            </div>

            {/* Saved Lineups */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                Saved Lineups ({savedLineups.length})
              </h3>
              {savedLineups.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedLineups.map((saved, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{saved.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(saved.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${
                          saved.chemistry > 0 ? 'text-green-600' : saved.chemistry < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {saved.chemistry > 0 ? '+' : ''}{saved.chemistry}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadLineup(saved)}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteLineup(idx)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No saved lineups yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Save Lineup</h3>
              <input
                type="text"
                value={saveLineupName}
                onChange={e => setSaveLineupName(e.target.value)}
                placeholder="Enter lineup name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                onKeyDown={e => e.key === 'Enter' && handleSaveLineup()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveLineup}
                  disabled={!saveLineupName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveLineupName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
