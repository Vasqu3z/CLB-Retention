'use client';

import { useState } from 'react';

interface SeasonToggleProps {
  isPlayoffs: boolean;
  onChange: (isPlayoffs: boolean) => void;
}

export default function SeasonToggle({ isPlayoffs, onChange }: SeasonToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border-2 border-gray-300 bg-white p-1">
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          !isPlayoffs
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Regular Season
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isPlayoffs
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Playoffs
      </button>
    </div>
  );
}
