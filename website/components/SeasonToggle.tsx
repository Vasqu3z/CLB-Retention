'use client';

import { useState } from 'react';

interface SeasonToggleProps {
  isPlayoffs: boolean;
  onChange: (isPlayoffs: boolean) => void;
}

export default function SeasonToggle({ isPlayoffs, onChange }: SeasonToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-cosmic-border bg-space-black/30 backdrop-blur-sm p-1">
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-md text-sm font-display font-semibold transition-all duration-300 ${
          !isPlayoffs
            ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
            : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
        }`}
      >
        Regular Season
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-md text-sm font-display font-semibold transition-all duration-300 ${
          isPlayoffs
            ? 'bg-gradient-to-r from-solar-gold to-comet-yellow text-space-black shadow-lg'
            : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
        }`}
      >
        Playoffs
      </button>
    </div>
  );
}
