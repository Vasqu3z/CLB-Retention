export default function TeamSkeleton() {
  return (
    <div className="space-y-8">
      <div className="relative p-6 rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(0,243,255,0.12)] animate-pulse overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(0,243,255,0.2),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,77,77,0.18),_transparent_40%)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-64 h-24 rounded-xl bg-white/10" />
          <div className="h-10 w-28 rounded-full bg-white/10" />
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="h-5 w-16 rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-white/10 bg-surface-dark/80 shadow-[0_0_24px_rgba(244,208,63,0.12)] animate-pulse">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {['Hitting', 'Pitching', 'Fielding', 'Schedule'].map((label) => (
            <div key={label} className="h-8 w-20 rounded-full bg-white/10" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-white/10" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-3 w-full rounded-full bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
