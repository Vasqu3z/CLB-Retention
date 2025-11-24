import { getCalculatedBattingLeaders } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import HomePageClient, { HighlightStat } from "./HomePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function mapLeaderToHighlight(
  leader: { player: string; team: string; formatted: string } | undefined,
  label: string,
  defaultColor: string
): HighlightStat | null {
  if (!leader) return null;

  const teamConfig = getTeamByName(leader.team);
  return {
    label,
    value: leader.formatted,
    subtext: leader.team ? `${leader.player} • ${leader.team}` : leader.player,
    glowColor: teamConfig?.primaryColor || defaultColor
  };
}

export default async function HomePage() {
  const battingLeaders = await getCalculatedBattingLeaders();

  const highlights = [
    mapLeaderToHighlight(battingLeaders.ops?.[0], "OPS Leader", "#00F3FF"),
    mapLeaderToHighlight(battingLeaders.hr?.[0], "Home Runs", "#F4D03F"),
    mapLeaderToHighlight(battingLeaders.avg?.[0], "Batting Avg", "#FF4D4D"),
  ].filter(Boolean) as HighlightStat[];

  return <HomePageClient highlights={highlights} />;
}
