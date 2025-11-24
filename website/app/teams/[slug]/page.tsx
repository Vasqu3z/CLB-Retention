import { notFound } from "next/navigation";
import { getTeamBySlug } from "@/config/league";
import { getSchedule, getStandings, getTeamRegistry, getTeamRoster } from "@/lib/sheets";
import TeamDetailClient from "./TeamDetailClient";

export const revalidate = 60;

function formatOrdinal(rank: string | number | undefined) {
  if (!rank) return "Pending";
  const num = Number(rank);
  if (Number.isNaN(num)) return String(rank);
  const suffix = ["th", "st", "nd", "rd"][(((num + 90) % 100) - 10) % 10] || "th";
  return `${num}${suffix}`;
}

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teamConfig = getTeamBySlug(slug);

  if (!teamConfig) {
    return notFound();
  }

  const [standings, schedule, teamRegistry, roster] = await Promise.all([
    getStandings(),
    getSchedule(),
    getTeamRegistry(),
    getTeamRoster(teamConfig.name),
  ]);

  const registryEntry = teamRegistry.find((t) => t.teamName === teamConfig.name);
  const standingRow = standings.find((s) => s.team === teamConfig.name);

  const team = {
    name: teamConfig.name,
    code: registryEntry?.abbr || teamConfig.shortName || teamConfig.name.slice(0, 3).toUpperCase(),
    logoColor: registryEntry?.color || teamConfig.primaryColor,
    record: standingRow ? `${standingRow.wins}-${standingRow.losses}` : "0-0",
    standing: formatOrdinal(standingRow?.rank),
    streak: standingRow?.h2hNote || "N/A",
  };

  const filteredSchedule = schedule
    .filter((game) => game.homeTeam === teamConfig.name || game.awayTeam === teamConfig.name)
    .map((game, index) => {
      const homeMeta = teamRegistry.find((t) => t.teamName === game.homeTeam);
      const awayMeta = teamRegistry.find((t) => t.teamName === game.awayTeam);

      return {
        id: `${game.week}-${index}`,
        home: {
          name: game.homeTeam,
          code: homeMeta?.abbr || game.homeTeam.slice(0, 3).toUpperCase(),
          logoColor: homeMeta?.color || teamConfig.primaryColor,
          score: game.homeScore,
        },
        away: {
          name: game.awayTeam,
          code: awayMeta?.abbr || game.awayTeam.slice(0, 3).toUpperCase(),
          logoColor: awayMeta?.color || teamConfig.primaryColor,
          score: game.awayScore,
        },
        date: `Week ${game.week}`,
        time: game.played ? "FINAL" : "TBD",
        isFinished: game.played,
      };
    });

  const rosterRows = roster.map((player, index) => ({
    id: `${player.name}-${index}`,
    name: player.name,
    position: "UTIL",
    avg: player.avg || ".000",
    hr: player.hr || 0,
    ops: player.ops || "0.000",
  }));

  return (
    <TeamDetailClient
      team={team}
      roster={rosterRows}
      schedule={filteredSchedule}
    />
  );
}
