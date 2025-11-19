'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface StatDefinition {
  name: string;
  formula?: string;
  description: string;
}

const statDefinitions: Record<string, StatDefinition> = {
  // Batting Stats
  AVG: {
    name: 'Batting Average',
    formula: 'H ÷ AB',
    description: 'The ratio of hits to at-bats. Measures how often a batter gets a hit.',
  },
  OBP: {
    name: 'On-Base Percentage',
    formula: '(H + BB + HBP) ÷ (AB + BB + HBP + SF)',
    description: 'The rate at which a batter reaches base per plate appearance.',
  },
  SLG: {
    name: 'Slugging Percentage',
    formula: 'Total Bases ÷ AB',
    description: 'Measures the power of a hitter by total bases per at-bat.',
  },
  OPS: {
    name: 'On-Base Plus Slugging',
    formula: 'OBP + SLG',
    description: 'Combines ability to get on base with power hitting.',
  },
  H: {
    name: 'Hits',
    description: 'Total number of hits by a batter.',
  },
  '2B': {
    name: 'Doubles',
    description: 'Hits where the batter reaches second base safely.',
  },
  '3B': {
    name: 'Triples',
    description: 'Hits where the batter reaches third base safely.',
  },
  HR: {
    name: 'Home Runs',
    description: 'Hits where the batter circles all bases and scores.',
  },
  RBI: {
    name: 'Runs Batted In',
    description: 'Number of runs a batter drives in with hits, walks, or sacrifices.',
  },
  R: {
    name: 'Runs',
    description: 'Number of times a player crosses home plate to score.',
  },
  BB: {
    name: 'Walks (Base on Balls)',
    description: 'Times a batter reaches first base due to four balls.',
  },
  K: {
    name: 'Strikeouts',
    description: 'Times a batter is called out on strikes.',
  },
  SB: {
    name: 'Stolen Bases',
    description: 'Number of times a runner successfully advances a base without a hit.',
  },
  AB: {
    name: 'At-Bats',
    description: 'Number of plate appearances that count toward batting average.',
  },
  PA: {
    name: 'Plate Appearances',
    description: 'Total number of times a batter completes a turn batting.',
  },

  // Pitching Stats
  ERA: {
    name: 'Earned Run Average',
    formula: '(ER × 9) ÷ IP',
    description: 'Average number of earned runs a pitcher allows per 9 innings.',
  },
  WHIP: {
    name: 'Walks + Hits per Inning Pitched',
    formula: '(BB + H) ÷ IP',
    description: 'Average number of baserunners a pitcher allows per inning.',
  },
  W: {
    name: 'Wins',
    description: 'Number of games won while the pitcher was the pitcher of record.',
  },
  L: {
    name: 'Losses',
    description: 'Number of games lost while the pitcher was the pitcher of record.',
  },
  SV: {
    name: 'Saves',
    description: 'Successfully finishing a game for the winning team under certain conditions.',
  },
  IP: {
    name: 'Innings Pitched',
    description: 'Number of innings a pitcher has pitched (in tenths).',
  },
  SO: {
    name: 'Strikeouts',
    description: 'Number of batters a pitcher has struck out.',
  },
  ER: {
    name: 'Earned Runs',
    description: 'Runs allowed that were not the result of fielding errors.',
  },
  CG: {
    name: 'Complete Games',
    description: 'Games where the pitcher pitched all innings for their team.',
  },

  // Fielding Stats
  FLD: {
    name: 'Fielding Percentage',
    formula: '(PO + A) ÷ (PO + A + E)',
    description: 'Percentage of fielding chances handled without error.',
  },
  E: {
    name: 'Errors',
    description: 'Misplays by a fielder that allow a batter or runner to advance.',
  },
  PO: {
    name: 'Putouts',
    description: 'Times a fielder records an out by catching, tagging, or forcing.',
  },
  A: {
    name: 'Assists',
    description: 'Times a fielder helps record an out (throws, deflections).',
  },
  NP: {
    name: 'Nice Plays',
    description: 'League-specific stat measuring exceptional defensive plays.',
  },
  ROB: {
    name: 'Hits Robbed',
    description: 'Hits taken away by defensive Nice Plays. Defensive stat.',
  },

  // Team Stats
  GB: {
    name: 'Games Back',
    description: 'Number of games a team trails the division leader.',
  },
  PCT: {
    name: 'Winning Percentage',
    formula: 'W ÷ (W + L)',
    description: 'Percentage of games won out of total games played.',
  },
  STRK: {
    name: 'Streak',
    description: 'Current consecutive wins (W) or losses (L).',
  },
  RS: {
    name: 'Runs Scored',
    description: 'Total runs scored by a team.',
  },
  RA: {
    name: 'Runs Against',
    description: 'Total runs allowed by a team.',
  },
  DIFF: {
    name: 'Run Differential',
    formula: 'RS - RA',
    description: 'Difference between runs scored and runs allowed.',
  },
};

interface StatTooltipProps {
  stat: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export default function StatTooltip({ stat, children, showIcon = false, iconOnly = false }: StatTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const statInfo = statDefinitions[stat.toUpperCase()];

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spaceAbove = triggerRect.top;
      const spaceBelow = window.innerHeight - triggerRect.bottom;

      // Position tooltip based on available space
      const shouldShowBelow = spaceAbove < tooltipRect.height + 10 && spaceBelow > spaceAbove;
      setPosition(shouldShowBelow ? 'bottom' : 'top');

      // Calculate fixed position coordinates
      const left = triggerRect.left + triggerRect.width / 2;
      const top = shouldShowBelow
        ? triggerRect.bottom + 8
        : triggerRect.top - tooltipRect.height - 8;

      setCoords({ top, left });
    } else if (!isVisible) {
      setCoords(null);
    }
  }, [isVisible]);

  if (!statInfo) {
    // If stat definition doesn't exist, just render the stat without tooltip
    return <>{children || stat}</>;
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center gap-1 group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="button"
      aria-label={`${stat}: ${statInfo.name}`}
      aria-describedby={isVisible ? `tooltip-${stat}` : undefined}
    >
      {!iconOnly && (
        <span className="cursor-help border-b border-dotted border-star-gray/50 group-hover:border-nebula-orange transition-colors">
          {children || stat}
        </span>
      )}

      {(showIcon || iconOnly) && (
        <HelpCircle className="w-3.5 h-3.5 text-star-gray/60 group-hover:text-nebula-orange transition-colors cursor-help" />
      )}

      {isVisible && (
        <div
          ref={tooltipRef}
          id={`tooltip-${stat}`}
          role="tooltip"
          className="fixed z-[9999] w-64 px-3 py-2.5 -translate-x-1/2 bg-space-navy/95 backdrop-blur-md border border-cosmic-border/80 rounded-lg shadow-2xl pointer-events-none"
          style={{
            top: coords ? `${coords.top}px` : '-9999px',
            left: coords ? `${coords.left}px` : '-9999px',
            opacity: coords ? 1 : 0,
            transition: coords ? 'opacity 200ms' : 'none',
          }}
        >
          {/* Arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-2 h-2
              bg-space-navy/95 border-cosmic-border/80
              rotate-45
              ${position === 'top'
                ? 'bottom-[-4px] border-r border-b'
                : 'top-[-4px] border-l border-t'
              }
            `}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="font-display font-semibold text-nebula-orange text-sm mb-1">
              {statInfo.name} ({stat.toUpperCase()})
            </div>

            {statInfo.formula && (
              <div className="font-mono text-xs text-nebula-teal mb-1.5 bg-space-blue/30 px-2 py-1 rounded">
                {statInfo.formula}
              </div>
            )}

            <div className="text-xs text-star-gray leading-relaxed">
              {statInfo.description}
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
