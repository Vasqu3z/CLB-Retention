import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'orange' | 'gold' | 'cyan' | 'teal' | 'pink' | 'coral';
  children?: ReactNode;
}

const colorClasses = {
  orange: {
    border: 'border-nebula-orange/50',
    gradient: 'from-nebula-orange/20 to-solar-gold/10',
    icon: 'text-nebula-orange',
    value: 'text-nebula-orange',
  },
  gold: {
    border: 'border-solar-gold/50',
    gradient: 'from-solar-gold/20 to-comet-yellow/10',
    icon: 'text-solar-gold',
    value: 'text-comet-yellow',
  },
  cyan: {
    border: 'border-nebula-cyan/50',
    gradient: 'from-nebula-cyan/20 to-nebula-teal/10',
    icon: 'text-nebula-cyan',
    value: 'text-nebula-cyan',
  },
  teal: {
    border: 'border-nebula-teal/50',
    gradient: 'from-nebula-teal/20 to-nebula-cyan/10',
    icon: 'text-nebula-teal',
    value: 'text-nebula-teal',
  },
  pink: {
    border: 'border-star-pink/50',
    gradient: 'from-star-pink/20 to-nebula-coral/10',
    icon: 'text-star-pink',
    value: 'text-star-pink',
  },
  coral: {
    border: 'border-nebula-coral/50',
    gradient: 'from-nebula-coral/20 to-nebula-orange/10',
    icon: 'text-nebula-coral',
    value: 'text-nebula-coral',
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  sublabel,
  trend,
  color = 'orange',
  children,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`
        relative p-6 rounded-xl border ${colors.border}
        bg-gradient-to-br ${colors.gradient}
        backdrop-blur-sm transition-all duration-300
        hover:scale-105
      `}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-star-gray font-semibold">
            {label}
          </div>
          {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
        </div>

        {/* Value */}
        <div className={`text-4xl font-stat font-bold ${colors.value} mb-1`}>
          {value}
        </div>

        {/* Sublabel */}
        {sublabel && (
          <div className="text-xs text-star-dim font-mono">
            {sublabel}
          </div>
        )}

        {/* Children (for custom content) */}
        {children && (
          <div className="mt-4 pt-4 border-t border-cosmic-border">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
