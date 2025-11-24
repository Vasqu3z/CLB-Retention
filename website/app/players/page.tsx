import { getAllPlayers } from "@/lib/sheets";
import { getActiveTeams } from "@/config/league";
import PlayersClient, { type PlayerRow } from "./PlayersClient";

export const revalidate = 60;

export default async function PlayersPage() {
  const playerStats = await getAllPlayers();
  const activeTeams = getActiveTeams();

  const maxGames = Math.max(1, ...playerStats.map((p) => p.gp || 0));

  const players: PlayerRow[] = playerStats.map((player, index) => ({
    id: `${player.name}-${index}`,
    name: player.name,
    team: player.team || "Free Agent",
    position: "UTIL",
    avg: player.avg || ".000",
    hr: player.hr || 0,
    ops: player.ops || "0.000",
    stamina: Math.round(((player.gp || 0) / maxGames) * 100),
  }));

  const teams = [
    "All Teams",
    ...Array.from(new Set(players.map((p) => p.team))).sort(
      (a, b) => a.localeCompare(b)
    ),
  ];

  return (
    <PlayersClient
      players={players}
      teams={teams.length > 1 ? teams : ["All Teams", ...activeTeams.map((t) => t.name)]}
    />
  );
}
