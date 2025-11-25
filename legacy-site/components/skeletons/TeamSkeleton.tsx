export default function TeamSkeleton() {
  return (
    <div className="space-y-8">
      <div className="glass-card relative p-6 rounded-xl border border-cosmic-border/50 bg-space-navy/40 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-64 h-24 rounded bg-space-navy" />
          <div className="h-10 w-28 rounded-full bg-space-navy/60" />
        </div>
        <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-space-navy/50" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="h-3 w-20 rounded bg-space-navy/70" />
              <div className="h-5 w-16 rounded bg-space-navy" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-cosmic-border/50 bg-space-navy/40 animate-pulse">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {['Hitting', 'Pitching', 'Fielding', 'Schedule'].map((label) => (
            <div key={label} className="h-8 w-20 rounded-full bg-space-navy/60" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-space-navy" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-3 w-full rounded bg-space-navy/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
