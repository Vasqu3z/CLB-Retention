import { getSchedule, getTeamRegistry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import ScheduleClient, { type MatchDisplay } from "./ScheduleClient";

export const revalidate = 60;

export default async function SchedulePage() {
  const [schedule, teamRegistry] = await Promise.all([
    getSchedule(),
    getTeamRegistry(),
  ]);

  const registryMap = new Map(teamRegistry.map((team) => [team.teamName, team]));

  const matches: MatchDisplay[] = schedule.map((game, index) => {
    const homeMeta = registryMap.get(game.homeTeam);
    const awayMeta = registryMap.get(game.awayTeam);
    const homeConfig = getTeamByName(game.homeTeam);
    const awayConfig = getTeamByName(game.awayTeam);

    const fallbackColor = "#6b7280";

    return {
      id: `${game.week}-${index}`,
      home: {
        name: game.homeTeam,
        code: homeMeta?.abbr || homeConfig?.shortName || game.homeTeam.slice(0, 3).toUpperCase(),
        logoColor: homeMeta?.color || homeConfig?.primaryColor || fallbackColor,
        score: game.homeScore,
      },
      away: {
        name: game.awayTeam,
        code: awayMeta?.abbr || awayConfig?.shortName || game.awayTeam.slice(0, 3).toUpperCase(),
        logoColor: awayMeta?.color || awayConfig?.primaryColor || fallbackColor,
        score: game.awayScore,
      },
      dateLabel: `Week ${game.week}`,
      statusLabel: game.played ? "FINAL" : "TBD",
      isFinished: game.played,
    };
  });

  const weeks = Array.from(new Set(matches.map((m) => m.dateLabel)))
    .map((label) => Number(label.replace(/\D/g, "")))
    .filter((week) => !Number.isNaN(week))
    .sort((a, b) => a - b);

  const matchesByWeek = matches.reduce<Record<number, MatchDisplay[]>>((acc, match) => {
    const weekNumber = Number(match.dateLabel.replace(/\D/g, ""));
    if (!acc[weekNumber]) {
      acc[weekNumber] = [];
    }
    acc[weekNumber].push(match);
    return acc;
  }, {});

  const initialWeek = weeks.length ? weeks[0] : 1;

  return (
    <ScheduleClient
      weeks={weeks.length ? weeks : [initialWeek]}
      matchesByWeek={matchesByWeek}
      initialWeek={initialWeek}
    />
  );
}
