import { Zap } from 'lucide-react';

export default function LiveStatsIndicator() {
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <Zap className="w-4 h-4 text-nebula-teal animate-pulse" />
      <span className="font-mono text-star-gray">Live Statistics • 60s Updates</span>
      <Zap className="w-4 h-4 text-nebula-teal animate-pulse" />
    </div>
  );
}
