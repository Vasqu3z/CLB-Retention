import { cn } from "@/lib/utils";

interface RetroCardGridSkeletonProps {
  items?: number;
  className?: string;
  columns?: string;
}

export default function RetroCardGridSkeleton({
  items = 6,
  className,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: RetroCardGridSkeletonProps) {
  return (
    <div className={cn(`grid ${columns} gap-6`, className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0f2d] via-[#0e1636] to-[#0f1a3a] shadow-[0_0_32px_rgba(0,243,255,0.12)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,243,255,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,95,207,0.12),transparent_30%)] opacity-70" />
          <div className="absolute inset-0 scanlines opacity-10" />

          <div className="relative p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 shadow-[0_0_14px_rgba(0,243,255,0.35)] animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded-full bg-gradient-to-r from-white/15 via-white/25 to-white/15 animate-pulse" />
              <div className="h-3 w-2/3 rounded-full bg-white/10 animate-pulse" />
            </div>

            <div className="space-y-2 pt-2">
              {[...Array(3)].map((__, lineIdx) => (
                <div
                  key={lineIdx}
                  className="h-3 w-full rounded-full bg-gradient-to-r from-comets-cyan/10 via-white/15 to-comets-purple/10 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-comets-cyan/70 to-transparent" />
        </div>
      ))}
    </div>
  );
}
