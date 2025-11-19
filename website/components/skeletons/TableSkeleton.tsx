import SurfaceCard from '@/components/SurfaceCard';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 6, rows = 6 }: TableSkeletonProps) {
  const headerPlaceholders = Array.from({ length: columns });
  const rowPlaceholders = Array.from({ length: rows });

  return (
    <SurfaceCard className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border/60">
            <tr>
              {headerPlaceholders.map((_, idx) => (
                <th key={`header-${idx}`} className="px-4 py-3 text-left">
                  <div className="h-3 w-20 rounded bg-space-navy/60 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowPlaceholders.map((_, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className={`border-b border-cosmic-border/30 ${rowIdx % 2 === 0 ? 'bg-space-navy/10' : 'bg-space-navy/5'}`}
              >
                {headerPlaceholders.map((__, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className="px-4 py-3">
                    <div className="h-3 rounded bg-space-navy/40 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}
