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
          className="p-6 rounded-2xl border border-white/10 h-48 flex flex-col justify-between bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="h-16 w-16 rounded-full bg-white/10" />
            <div className="h-6 w-16 rounded-full bg-white/10" />
          </div>

          <div className="space-y-3 mt-4">
            <div className="h-6 w-3/4 rounded-full bg-white/10" />
            <div className="h-4 w-1/2 rounded-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
