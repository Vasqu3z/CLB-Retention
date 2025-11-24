export default function RetroProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#0a0f2d] via-[#111a3c] to-[#161f46] p-8 shadow-[0_0_36px_rgba(0,243,255,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,243,255,0.16),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(255,95,207,0.12),transparent_32%)] opacity-70" />
        <div className="absolute inset-0 scanlines opacity-10" />

        <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-white/10 via-comets-cyan/30 to-white/5 animate-pulse shadow-[0_0_26px_rgba(0,243,255,0.25)]" />
          <div className="flex-1 space-y-4">
            <div className="h-10 w-72 rounded-full bg-white/10 animate-pulse" />
            <div className="h-5 w-96 rounded-full bg-white/10 animate-pulse" />
            <div className="flex gap-3 pt-2 flex-wrap">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="h-8 w-28 rounded-full bg-gradient-to-r from-comets-cyan/20 to-comets-purple/20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-3">
        {["Overview", "Hitting", "Pitching", "Fielding"].map((label) => (
          <div
            key={label}
            className="h-11 w-28 rounded-xl bg-white/5 animate-pulse shadow-[0_0_18px_rgba(0,243,255,0.18)]"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0f2d] via-[#0e1636] to-[#0f1a3a] p-6 shadow-[0_0_28px_rgba(255,95,207,0.14)]"
          >
            <div className="absolute inset-0 scanlines opacity-10" />
            <div className="relative space-y-3">
              <div className="h-5 w-32 rounded-full bg-white/10 animate-pulse" />
              {[...Array(8)].map((__, lineIdx) => (
                <div
                  key={lineIdx}
                  className="h-3 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
