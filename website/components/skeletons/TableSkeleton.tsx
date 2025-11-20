import SurfaceCard from '@/components/SurfaceCard';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 6, rows = 6 }: TableSkeletonProps) {
  const headerPlaceholders = Array.from({ length: columns });
  const rowPlaceholders = Array.from({ length: rows });

  return (
    <SurfaceCard className="p-0 overflow-hidden bg-space-navy/40 border border-cosmic-border">
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead className="bg-space-navy/70 backdrop-blur-md border-b border-cosmic-border/60">
            <tr>
              {headerPlaceholders.map((_, idx) => (
                <th key={`header-${idx}`} className="px-4 py-3 text-left">
                  <div className="h-3 w-20 rounded bg-space-navy/90 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowPlaceholders.map((_, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className={`border-b border-cosmic-border/30 ${rowIdx % 2 === 0 ? 'bg-space-navy/25' : 'bg-space-navy/15'}`}
              >
                {headerPlaceholders.map((__, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className="px-4 py-3">
                    <div className="h-3 rounded bg-space-navy/80 animate-pulse" />
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
