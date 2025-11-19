'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PlayerMultiSelectProps {
  players: string[];
  selectedPlayers: string[];
  onSelectionChange: (players: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
}

export default function PlayerMultiSelect({
  players,
  selectedPlayers,
  onSelectionChange,
  maxSelections = 5,
  placeholder = 'Search players...',
  className = '',
}: PlayerMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownMenuRef.current?.contains(target);

      if (!isInsideTrigger && !isInsideDropdown) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track dropdown position to render via portal
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, selectedPlayers.length]);

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

  const dropdownBaseClass =
    'rounded-xl border border-cosmic-border/70 bg-[#050c1f]/98 shadow-[0_25px_80px_rgba(5,12,31,0.85)] backdrop-blur-2xl';

  const dropdownPositionStyle = {
    position: 'absolute' as const,
    top: dropdownPosition.top,
    left: dropdownPosition.left,
    width: dropdownPosition.width,
    zIndex: 1000,
  };

  const dropdownList = (
    <div
      ref={dropdownMenuRef}
      style={dropdownPositionStyle}
      className={`${dropdownBaseClass} max-h-64 overflow-y-auto before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent`}
      onWheel={(e) => e.stopPropagation()}
    >
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
  );

  const emptyDropdown = (
    <div
      ref={dropdownMenuRef}
      style={dropdownPositionStyle}
      className={`${dropdownBaseClass} px-4 py-6 text-center`}
    >
      <p className="text-star-dim font-mono text-sm">No players found matching &ldquo;{searchQuery}&rdquo;</p>
    </div>
  );

  return (
    <div
      className={`glass-card p-6 ${className}`.trim()}
      ref={containerRef}
      style={{ overflow: 'visible' }}
    >
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
      <div className="relative" ref={triggerRef}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim()) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (searchQuery.trim()) {
              setIsOpen(true);
            }
          }}
          placeholder={selectedPlayers.length >= maxSelections ? `Maximum ${maxSelections} players selected` : placeholder}
          disabled={selectedPlayers.length >= maxSelections}
          className={`w-full px-4 py-3 bg-space-blue/50 border-2 border-cosmic-border rounded-lg text-star-white font-mono placeholder-star-dim focus:outline-none focus:border-nebula-orange transition-all duration-300 ${
            selectedPlayers.length >= maxSelections ? 'cursor-not-allowed opacity-50' : ''
          }`}
        />

        {/* Dropdown menu */}
        {isMounted && isOpen && searchQuery.trim() && selectedPlayers.length < maxSelections && filteredPlayers.length > 0 &&
          createPortal(dropdownList, document.body)}

        {isMounted && isOpen && filteredPlayers.length === 0 && searchQuery.trim() && selectedPlayers.length < maxSelections &&
          createPortal(emptyDropdown, document.body)}
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
