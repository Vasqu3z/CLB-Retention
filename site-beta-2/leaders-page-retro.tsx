import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getCalculatedFieldingLeaders } from "@/lib/sheets";
import LeadersView from "@/components/views/LeadersView";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LeadersPage() {
  // Fetch both regular season and playoff leaders
  const [
    battingLeaders,
    pitchingLeaders,
    fieldingLeaders,
    playoffBattingLeaders,
    playoffPitchingLeaders,
    playoffFieldingLeaders,
  ] = await Promise.all([
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getCalculatedFieldingLeaders(false),
    getCalculatedBattingLeaders(true),
    getCalculatedPitchingLeaders(true),
    getCalculatedFieldingLeaders(true),
  ]);

  return (
    <div className="space-y-8 pb-12">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-arcade-cyan/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-arcade-yellow/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-arcade-cyan via-arcade-yellow to-arcade-purple rounded-full opacity-60" />
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-arcade-cyan via-arcade-yellow to-arcade-yellow bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(0,243,255,0.5)]">
            LEAGUE LEADERS
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-ui tracking-wide">
          TOP PERFORMERS • STAT RANKINGS
        </p>
      </div>

      <LeadersView
        initialBattingLeaders={battingLeaders}
        initialPitchingLeaders={pitchingLeaders}
        initialFieldingLeaders={fieldingLeaders}
        playoffBattingLeaders={playoffBattingLeaders}
        playoffPitchingLeaders={playoffPitchingLeaders}
        playoffFieldingLeaders={playoffFieldingLeaders}
      />
    </div>
  );
}
