export default function RetroTeamSkeleton() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#0b0f24] via-[#111a3d] to-[#161f46] p-8 shadow-[0_0_40px_rgba(255,228,114,0.14)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,220,0,0.14),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(0,243,255,0.12),transparent_32%)] opacity-80" />
        <div className="absolute inset-0 scanlines opacity-10" />

        <div className="relative grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-center">
          <div className="space-y-4">
            <div className="h-10 w-44 rounded-full bg-white/10 animate-pulse" />
            <div className="h-14 w-72 rounded-lg bg-gradient-to-r from-comets-yellow/40 to-comets-red/40 animate-pulse" />
            <div className="flex flex-wrap gap-3 pt-2">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-9 w-24 rounded-full bg-white/10 animate-pulse shadow-[0_0_16px_rgba(0,243,255,0.2)]"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-white/10 via-comets-yellow/30 to-white/5 animate-pulse shadow-[0_0_30px_rgba(255,228,114,0.25)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0f2d] via-[#0f1737] to-[#0f1a3a] p-6 shadow-[0_0_28px_rgba(0,243,255,0.12)]"
          >
            <div className="absolute inset-0 scanlines opacity-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,95,207,0.1),transparent_30%)]" />
            <div className="relative space-y-4">
              <div className="h-5 w-40 rounded-full bg-white/15 animate-pulse" />
              <div className="space-y-3">
                {[...Array(6)].map((__, lineIdx) => (
                  <div
                    key={lineIdx}
                    className="h-3 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white/10 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
