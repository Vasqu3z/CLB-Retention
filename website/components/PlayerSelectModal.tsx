'use client';

import { useState, useRef, useEffect } from 'react';

interface PlayerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (player: string) => void;
  availablePlayers: string[];
  title: string;
}

export default function PlayerSelectModal({
  isOpen,
  onClose,
  availablePlayers,
  onSelect,
  title,
}: PlayerSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter players based on search query
  const filteredPlayers = availablePlayers.filter(player =>
    player.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (player: string) => {
    onSelect(player);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="glass-card p-6 max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-display font-bold text-star-white mb-4">{title}</h3>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players..."
          className="w-full px-4 py-3 bg-space-blue/50 border-2 border-cosmic-border rounded-lg text-star-white font-mono placeholder-star-dim focus:outline-none focus:border-nebula-orange transition-all duration-300 mb-4"
        />

        {/* Player List */}
        {filteredPlayers.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {filteredPlayers.map(player => (
              <button
                key={player}
                onClick={() => handleSelect(player)}
                className="w-full px-4 py-2.5 text-left bg-space-blue/50 hover:bg-space-blue/70 border border-cosmic-border hover:border-nebula-orange/50 rounded-lg text-star-white font-display font-semibold transition-all duration-200"
              >
                {player}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-star-dim font-mono text-sm">
              {searchQuery ? `No players found matching "${searchQuery}"` : 'No players available'}
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/50 rounded-lg hover:bg-red-500/30 font-display font-semibold transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
