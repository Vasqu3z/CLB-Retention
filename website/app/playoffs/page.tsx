import { getPlayoffSchedule, groupGamesBySeries, buildBracket } from "@/lib/sheets";
import BracketView from "./BracketView";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PlayoffsPage() {
  const playoffGames = await getPlayoffSchedule();
  const seriesMap = groupGamesBySeries(playoffGames);
  const bracket = buildBracket(seriesMap);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-solar-gold via-comet-yellow to-nebula-orange bg-clip-text text-transparent">
          Playoff Bracket
        </h1>
        <p className="text-star-gray font-mono">
          Postseason series and championship path
        </p>
      </div>

      <BracketView bracket={bracket} />
    </div>
  );
}
