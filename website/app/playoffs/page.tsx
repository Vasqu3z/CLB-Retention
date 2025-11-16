import { getPlayoffSchedule, groupGamesBySeries, buildBracket, getStandings } from "@/lib/sheets";
import BracketView from "./BracketView";
import FadeIn from "@/components/animations/FadeIn";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PlayoffsPage() {
  const [playoffGames, standings] = await Promise.all([
    getPlayoffSchedule(),
    getStandings(),
  ]);

  const seriesMap = groupGamesBySeries(playoffGames);
  const bracket = buildBracket(seriesMap);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-solar-gold via-comet-yellow to-nebula-orange bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Playoff Bracket
          </h1>
          <p className="text-star-gray font-mono text-shadow">
            League Schedule • Postseason
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <BracketView bracket={bracket} standings={standings} />
      </FadeIn>
    </div>
  );
}
