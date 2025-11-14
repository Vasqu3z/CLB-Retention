import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getCalculatedFieldingLeaders } from "@/lib/sheets";
import LeadersView from "./LeadersView";

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
    <LeadersView
      initialBattingLeaders={battingLeaders}
      initialPitchingLeaders={pitchingLeaders}
      initialFieldingLeaders={fieldingLeaders}
      playoffBattingLeaders={playoffBattingLeaders}
      playoffPitchingLeaders={playoffPitchingLeaders}
      playoffFieldingLeaders={playoffFieldingLeaders}
    />
  );
}
