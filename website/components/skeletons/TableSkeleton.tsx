interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 6, rows = 6 }: TableSkeletonProps) {
  const headerPlaceholders = Array.from({ length: columns });
  const rowPlaceholders = Array.from({ length: rows });

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.15)] overflow-hidden">
      <div className="bg-gradient-to-r from-comets-cyan/10 via-comets-purple/10 to-comets-red/10 h-2" />
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm text-white/80">
          <thead className="bg-black/40 backdrop-blur border-b border-white/10">
            <tr>
              {headerPlaceholders.map((_, idx) => (
                <th key={`header-${idx}`} className="px-4 py-3 text-left">
                  <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowPlaceholders.map((_, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className={`border-b border-white/5 ${rowIdx % 2 === 0 ? 'bg-white/5' : 'bg-white/0'}`}
              >
                {headerPlaceholders.map((__, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className="px-4 py-3">
                    <div className="h-3 rounded-full bg-white/10 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
