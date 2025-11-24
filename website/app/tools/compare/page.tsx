import { getAllPlayers } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import CompareClient, { HeadToHeadPlayer } from "./CompareClient";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function parseRate(value?: string) {
  if (!value) return 0;
  const withLeading = value.startsWith(".") ? `0${value}` : value;
  const parsed = parseFloat(withLeading);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapPlayerToHeadToHead(player: { name: string; team: string; avg?: string; hr?: number; ops?: string; }): HeadToHeadPlayer {
  const teamConfig = getTeamByName(player.team);
  const opsValue = player.ops || "0.000";
  const avgValue = player.avg ? (player.avg.startsWith(".") ? player.avg : player.avg.padStart(5, "0")) : ".000";

  return {
    name: player.name,
    team: teamConfig?.shortName || player.team,
    color: teamConfig?.primaryColor || "#00F3FF",
    stats: {
      avg: avgValue,
      hr: player.hr || 0,
      ops: opsValue.startsWith(".") ? `0${opsValue}` : opsValue,
    }
  };
}

export default async function ComparePage() {
  const players = await getAllPlayers();
  const sortedByOps = [...players].sort((a, b) => parseRate(b.ops) - parseRate(a.ops));
  const [first, second] = sortedByOps;

  const fallback: HeadToHeadPlayer = {
    name: "Mario",
    team: "Fireballs",
    color: "#F4D03F",
    stats: { avg: ".000", hr: 0, ops: "0.000" }
  };

  return (
    <CompareClient
      playerA={first ? mapPlayerToHeadToHead(first) : fallback}
      playerB={second ? mapPlayerToHeadToHead(second) : fallback}
    />
  );
}
