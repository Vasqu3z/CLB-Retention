'use client';

import { useState, useRef, useEffect } from 'react';

interface PlayerMultiSelectProps {
  players: string[];
  selectedPlayers: string[];
  onSelectionChange: (players: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

export default function PlayerMultiSelect({
  players,
  selectedPlayers,
  onSelectionChange,
  maxSelections = 5,
  placeholder = 'Search players...',
}: PlayerMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter players based on search query
  const filteredPlayers = players.filter(player =>
    player.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(player => !selectedPlayers.includes(player));

  const handleTogglePlayer = (player: string) => {
    if (selectedPlayers.includes(player)) {
      onSelectionChange(selectedPlayers.filter(p => p !== player));
    } else if (selectedPlayers.length < maxSelections) {
      onSelectionChange([...selectedPlayers, player]);
      setSearchQuery('');
      inputRef.current?.focus();
    }
  };

  const handleRemovePlayer = (player: string) => {
    onSelectionChange(selectedPlayers.filter(p => p !== player));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="glass-card p-6 mb-6" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-star-white">
          Select Players <span className="text-nebula-orange">({selectedPlayers.length}/{maxSelections})</span>
        </h2>
        {selectedPlayers.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-400 hover:text-red-300 font-display font-semibold transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected players as chips */}
      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedPlayers.map(player => (
            <div
              key={player}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-nebula-orange to-nebula-coral text-white rounded-lg font-display font-semibold text-sm shadow-lg"
            >
              <span>{player}</span>
              <button
                onClick={() => handleRemovePlayer(player)}
                className="hover:text-red-200 transition-colors duration-200"
                aria-label={`Remove ${player}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedPlayers.length >= maxSelections ? `Maximum ${maxSelections} players selected` : placeholder}
          disabled={selectedPlayers.length >= maxSelections}
          className={`w-full px-4 py-3 bg-space-blue/50 border-2 border-cosmic-border rounded-lg text-star-white font-mono placeholder-star-dim focus:outline-none focus:border-nebula-orange transition-all duration-300 ${
            selectedPlayers.length >= maxSelections ? 'cursor-not-allowed opacity-50' : ''
          }`}
        />

        {/* Dropdown menu */}
        {isOpen && filteredPlayers.length > 0 && selectedPlayers.length < maxSelections && (
          <div className="absolute z-50 w-full mt-2 bg-space-navy/95 backdrop-blur-md border-2 border-cosmic-border rounded-lg shadow-2xl max-h-64 overflow-y-auto">
            {filteredPlayers.map(player => (
              <button
                key={player}
                onClick={() => handleTogglePlayer(player)}
                className="w-full px-4 py-2.5 text-left text-star-gray hover:text-star-white hover:bg-space-blue/70 transition-all duration-200 font-display font-semibold border-b border-cosmic-border/50 last:border-b-0 hover:border-nebula-orange/50"
              >
                {player}
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && filteredPlayers.length === 0 && searchQuery && selectedPlayers.length < maxSelections && (
          <div className="absolute z-50 w-full mt-2 bg-space-navy/95 backdrop-blur-md border-2 border-cosmic-border rounded-lg shadow-2xl px-4 py-6 text-center">
            <p className="text-star-dim font-mono text-sm">No players found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Helper text */}
      {selectedPlayers.length === 0 && (
        <p className="text-star-dim text-sm font-mono mt-2">
          Start typing to search and select up to {maxSelections} players
        </p>
      )}
    </div>
  );
}
