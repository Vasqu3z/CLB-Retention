import { cn } from "@/lib/utils";

interface RetroTableSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export default function RetroTableSkeleton({
  columns = 6,
  rows = 8,
  className,
}: RetroTableSkeletonProps) {
  const headerPlaceholders = Array.from({ length: columns });
  const rowPlaceholders = Array.from({ length: rows });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#050915] via-[#0b1226] to-[#0f1a3a] shadow-[0_0_35px_rgba(0,243,255,0.12)]",
        className
      )}
    >
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_10%_20%,rgba(0,243,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,95,207,0.12),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(255,220,0,0.1),transparent_30%)]" />
      <div className="absolute inset-0 scanlines opacity-10" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,243,255,0),rgba(0,243,255,0.15),rgba(0,243,255,0))] animate-[pulse_2.5s_ease-in-out_infinite]" />

      <div className="relative overflow-x-auto">
        <table className="w-full text-left">
          <thead className="uppercase text-[11px] tracking-[0.28em] text-comets-yellow/90">
            <tr className="border-b border-white/10 bg-white/5">
              {headerPlaceholders.map((_, idx) => (
                <th key={`header-${idx}`} className="p-4">
                  <div className="h-3 w-24 rounded-full bg-white/15 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowPlaceholders.map((_, rowIdx) => (
              <tr
                key={`row-${rowIdx}`}
                className="border-b border-white/5 last:border-none"
              >
                {headerPlaceholders.map((__, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className="p-4">
                    <div
                      className={cn(
                        "h-3 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white/10 animate-pulse",
                        colIdx === 0 ? "w-32" : "w-full"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-comets-yellow/60 to-transparent" />
    </div>
  );
}
