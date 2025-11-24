import LineupBuilderClient, { BuilderPlayer } from "./LineupBuilderClient";
import { getAllPlayerAttributes, getAllPlayers, getPlayerRegistry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";

export const dynamic = "force-dynamic";
export const revalidate = 300;

function formatAvg(value?: string) {
  if (!value) return ".000";
  return value.startsWith(".") ? value : value.padStart(5, "0");
}

export default async function LineupPage() {
  const [registry, playerStats, playerAttributes] = await Promise.all([
    getPlayerRegistry(),
    getAllPlayers(),
    getAllPlayerAttributes(),
  ]);

  const statsByName = new Map(playerStats.map((p) => [p.name, p]));
  const attributesByName = new Map(playerAttributes.map((p) => [p.name, p]));

  const availablePlayers: BuilderPlayer[] = registry.map((entry) => {
    const stat = statsByName.get(entry.playerName);
    const attributes = attributesByName.get(entry.playerName);
    const teamConfig = getTeamByName(entry.team);

    return {
      id: entry.databaseId || entry.playerName,
      name: entry.playerName,
      team: entry.team || "Free Agent",
      teamColor: teamConfig?.primaryColor || "#00F3FF",
      position: "P/C/1B/2B/3B/SS/LF/CF/RF",
      stats: {
        avg: formatAvg(stat?.avg),
        power: attributes?.chargeHitPower ?? attributes?.battingOverall ?? 50,
        speed: attributes?.speed ?? attributes?.speedOverall ?? 50,
        chemistry: attributes?.ability ? [attributes.ability] : [],
      },
    };
  });

  // Fallback to stat sheet in case registry is empty
  const fallbackPlayers: BuilderPlayer[] =
    availablePlayers.length > 0
      ? availablePlayers
      : playerStats.slice(0, 12).map((p) => {
          const teamConfig = getTeamByName(p.team);
          return {
            id: p.name,
            name: p.name,
            team: p.team,
            teamColor: teamConfig?.primaryColor || "#00F3FF",
            position: "P/C/1B/2B/3B/SS/LF/CF/RF",
            stats: {
              avg: formatAvg(p.avg),
              power: 50,
              speed: 50,
              chemistry: [],
            },
          };
        });

  return <LineupBuilderClient availablePlayers={fallbackPlayers} />;
}
