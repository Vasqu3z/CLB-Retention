import { cn } from '@/lib/utils';

interface CardGridSkeletonProps {
  itemCount?: number;
  className?: string;
}

export default function CardGridSkeleton({ itemCount = 8, className }: CardGridSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-6 rounded-xl border border-cosmic-border/50 h-48 flex flex-col justify-between bg-space-navy/40 animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="h-16 w-16 rounded-full bg-space-navy" />
            <div className="h-6 w-16 rounded bg-space-navy/50" />
          </div>

          <div className="space-y-3 mt-4">
            <div className="h-6 w-3/4 rounded bg-space-navy" />
            <div className="h-4 w-1/2 rounded bg-space-navy/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
