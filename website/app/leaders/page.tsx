import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getCalculatedFieldingLeaders } from "@/lib/sheets";
import LeadersView from "./LeadersView";
import FadeIn from "@/components/animations/FadeIn";

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
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-comet-yellow to-solar-gold bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            League Leaders
          </h1>
          <p className="text-star-gray font-mono text-shadow">
            Stats Leaders • Updated in real-time
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <LeadersView
          initialBattingLeaders={battingLeaders}
          initialPitchingLeaders={pitchingLeaders}
          initialFieldingLeaders={fieldingLeaders}
          playoffBattingLeaders={playoffBattingLeaders}
          playoffPitchingLeaders={playoffPitchingLeaders}
          playoffFieldingLeaders={playoffFieldingLeaders}
        />
      </FadeIn>
    </div>
  );
}
