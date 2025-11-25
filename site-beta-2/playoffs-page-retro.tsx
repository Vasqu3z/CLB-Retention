import { getPlayoffSchedule, groupGamesBySeries, buildBracket, getStandings } from "@/lib/sheets";
import BracketView from "@/components/views/BracketView";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PlayoffsPage() {
  const [playoffGames, standings] = await Promise.all([
    getPlayoffSchedule(),
    getStandings(),
  ]);

  const seriesMap = groupGamesBySeries(playoffGames);
  const bracket = buildBracket(seriesMap);

  return (
    <div className="space-y-8 pb-12">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-arcade-yellow/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-arcade-purple/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Page Header */}
      <div className="relative">
        <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-arcade-yellow via-arcade-red to-arcade-purple rounded-full opacity-60" />
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-arcade-yellow via-arcade-red to-arcade-purple bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(244,208,63,0.5)]">
            PLAYOFF BRACKET
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-ui tracking-wide">
          POSTSEASON • CHAMPIONSHIP PATH
        </p>
      </div>

      <BracketView bracket={bracket} standings={standings} />
    </div>
  );
}
