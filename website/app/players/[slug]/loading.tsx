export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Player Header Skeleton */}
      <div className="bg-space-navy/40 backdrop-blur-sm border border-nebula-purple/30 rounded-lg p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-nebula-purple/20" />
          <div className="flex-1 space-y-3">
            <div className="h-12 bg-nebula-purple/20 rounded w-64" />
            <div className="h-6 bg-nebula-purple/20 rounded w-96" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex gap-2 border-b border-nebula-purple/30">
        <div className="h-12 bg-nebula-purple/20 rounded w-24" />
        <div className="h-12 bg-nebula-purple/20 rounded w-32" />
        <div className="h-12 bg-nebula-purple/20 rounded w-28" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-space-navy/40 backdrop-blur-sm border border-nebula-purple/30 rounded-lg p-6">
            <div className="h-6 bg-nebula-purple/20 rounded w-32 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <div key={j} className="h-5 bg-nebula-purple/20 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
