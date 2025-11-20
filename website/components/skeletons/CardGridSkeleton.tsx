import SurfaceCard from '@/components/SurfaceCard';

interface CardGridSkeletonProps {
  cards?: number;
}

export default function CardGridSkeleton({ cards = 8 }: CardGridSkeletonProps) {
  const placeholders = Array.from({ length: cards });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {placeholders.map((_, idx) => (
        <SurfaceCard
          key={`card-${idx}`}
          className="h-full p-4 bg-space-navy/40 border border-cosmic-border/80 backdrop-blur-md animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-space-navy/90" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 rounded bg-space-navy/90" />
              <div className="h-3 w-16 rounded bg-space-navy/70" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-space-navy/70" />
            <div className="h-3 w-10/12 rounded bg-space-navy/80" />
            <div className="h-3 w-9/12 rounded bg-space-navy/60" />
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}
