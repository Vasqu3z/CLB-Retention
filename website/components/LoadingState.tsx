import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={`${sizeClasses[size]} text-nebula-orange animate-spin`}
        strokeWidth={2.5}
      />
      <p className={`${textSizeClasses[size]} text-star-gray font-mono animate-pulse`}>
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="glass-card py-16 px-4">
      {content}
    </div>
  );
}

// Skeleton loader for tables
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-nebula-orange animate-spin" strokeWidth={2.5} />
        <p className="text-star-gray font-mono text-sm animate-pulse">Loading data...</p>
      </div>

      {/* Skeleton table */}
      <div className="glass-card overflow-hidden border border-nebula-orange/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-space-blue/50 border-b border-cosmic-border">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 bg-gradient-to-r from-space-blue/40 to-nebula-orange/20 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-cosmic-border/30">
                  {Array.from({ length: columns }).map((_, colIdx) => (
                    <td key={colIdx} className="px-4 py-3">
                      <div
                        className="h-4 bg-gradient-to-r from-space-navy/30 to-space-blue/20 rounded animate-pulse"
                        style={{
                          animationDelay: `${(rowIdx * columns + colIdx) * 50}ms`,
                          width: colIdx === 0 ? '60%' : '80%'
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Card skeleton for team/player cards
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-nebula-orange animate-spin" strokeWidth={2.5} />
        <p className="text-star-gray font-mono text-sm animate-pulse">Loading data...</p>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-4 border border-nebula-orange/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-space-blue/40 to-nebula-orange/20 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-space-blue/40 to-nebula-orange/20 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gradient-to-r from-space-navy/30 to-space-blue/20 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-space-navy/30 to-space-blue/20 rounded animate-pulse" />
              <div className="h-3 bg-gradient-to-r from-space-navy/30 to-space-blue/20 rounded animate-pulse w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
