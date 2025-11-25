import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statCardVariants = cva(
  'relative rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:scale-105',
  {
    variants: {
      color: {
        orange: 'border-nebula-orange/50 from-nebula-orange/20 to-solar-gold/10',
        gold: 'border-solar-gold/50 from-solar-gold/20 to-comet-yellow/10',
        cyan: 'border-nebula-cyan/50 from-nebula-cyan/20 to-nebula-teal/10',
        teal: 'border-nebula-teal/50 from-nebula-teal/20 to-nebula-cyan/10',
        pink: 'border-star-pink/50 from-star-pink/20 to-nebula-coral/10',
        coral: 'border-nebula-coral/50 from-nebula-coral/20 to-nebula-orange/10',
      },
      size: {
        base: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      color: 'orange',
      size: 'lg',
    },
  }
);

const valueVariants = cva('font-stat font-bold mb-1', {
  variants: {
    color: {
      orange: 'text-nebula-orange',
      gold: 'text-comet-yellow',
      cyan: 'text-nebula-cyan',
      teal: 'text-nebula-teal',
      pink: 'text-star-pink',
      coral: 'text-nebula-coral',
    },
    size: {
      base: 'text-3xl sm:text-4xl',
      lg: 'text-4xl sm:text-5xl',
    },
  },
  defaultVariants: {
    color: 'orange',
    size: 'lg',
  },
});

const accentColorMap: Record<NonNullable<StatCardProps['color']>, string> = {
  orange: 'text-nebula-orange',
  gold: 'text-solar-gold',
  cyan: 'text-nebula-cyan',
  teal: 'text-nebula-teal',
  pink: 'text-star-pink',
  coral: 'text-nebula-coral',
};

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  children?: ReactNode;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  sublabel,
  trend,
  color = 'orange',
  size = 'lg',
  children,
}: StatCardProps) {
  const resolvedColor = color ?? 'orange';
  const accentColor = accentColorMap[resolvedColor];

  return (
    <div className={cn(statCardVariants({ color, size }))}>
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-star-gray font-semibold">
            {label}
          </div>
          {Icon && <Icon className={cn('w-5 h-5', accentColor)} />}
        </div>

        {/* Value */}
        <div className={valueVariants({ color, size })}>
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
