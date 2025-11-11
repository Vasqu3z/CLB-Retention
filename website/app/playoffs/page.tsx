import { getPlayoffSchedule, groupGamesBySeries, buildBracket } from "@/lib/sheets";
import BracketView from "./BracketView";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PlayoffsPage() {
  const playoffGames = await getPlayoffSchedule();
  const seriesMap = groupGamesBySeries(playoffGames);
  const bracket = buildBracket(seriesMap);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Playoff Bracket</h1>
      <BracketView bracket={bracket} />
    </div>
  );
}
