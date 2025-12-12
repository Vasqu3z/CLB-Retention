import {
  getStandings,
  getSchedule,
  getPlayoffSchedule,
  getAllPlayers,
  getAverageTeamGP,
  getTeamRegistry,
} from "@/lib/sheets";
import { playerNameToSlug } from "@/lib/utils";
import { QUALIFICATION_THRESHOLDS } from "@/config/sheets";
import SidebarHUDClient from "./SidebarHUDClient";

// Server component that fetches data and passes to client
export default async function SidebarHUD() {
  // Fetch all data in parallel
  const [standings, schedule, playoffSchedule, players, avgTeamGP, teamRegistry] = await Promise.all([
    getStandings(false),
    getSchedule(),
    getPlayoffSchedule(),
    getAllPlayers(false),
    getAverageTeamGP(false),
    getTeamRegistry(),
  ]);

  // Create team lookup map
  const teamMap = new Map(
    teamRegistry.map(t => [t.teamName, { color: t.color, abbr: t.abbr, emblemUrl: t.emblemUrl }])
  );

  // Transform standings for client
  const standingsData = standings.slice(0, 8).map(team => {
    const teamInfo = teamMap.get(team.team);
    return {
      rank: team.rank,
      team: team.team,
      abbr: teamInfo?.abbr || team.team.substring(0, 3).toUpperCase(),
      wins: team.wins,
      losses: team.losses,
      winPct: team.winPct,
      color: teamInfo?.color || "#ffffff",
      emblemUrl: teamInfo?.emblemUrl || "",
      slug: team.team.toLowerCase().replace(/\s+/g, "-"),
    };
  });

  // Calculate qualification thresholds
  const qualifyingAB = avgTeamGP * QUALIFICATION_THRESHOLDS.BATTING.AB_MULTIPLIER;
  const qualifyingIP = avgTeamGP * QUALIFICATION_THRESHOLDS.PITCHING.IP_MULTIPLIER;

  // Get league leaders
  const qualifiedHitters = players.filter(p => p.ab && p.ab >= qualifyingAB);
  const qualifiedPitchers = players.filter(p => p.ip && p.ip >= qualifyingIP);
  const allHitters = players.filter(p => p.ab && p.ab > 0);

  // Batting Average leaders (qualified)
  const battingLeaders = [...qualifiedHitters]
    .sort((a, b) => parseFloat("0" + (b.avg || ".000")) - parseFloat("0" + (a.avg || ".000")))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      value: p.avg || ".000",
      team: p.team,
      slug: playerNameToSlug(p.name),
    }));

  // Home Run leaders (no qualification)
  const hrLeaders = [...allHitters]
    .sort((a, b) => (b.hr || 0) - (a.hr || 0))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      value: p.hr || 0,
      team: p.team,
      slug: playerNameToSlug(p.name),
    }));

  // ERA leaders (qualified, lower is better)
  const eraLeaders = [...qualifiedPitchers]
    .sort((a, b) => parseFloat(a.era || "999") - parseFloat(b.era || "999"))
    .slice(0, 3)
    .map(p => ({
      name: p.name,
      value: p.era || "-.--",
      team: p.team,
      slug: playerNameToSlug(p.name),
    }));

  // Get recent games (regular season + playoffs)
  const currentWeek = schedule.length > 0
    ? Math.max(...schedule.map(g => g.week))
    : 0;

  // Combine and sort all completed games
  const regularGames = schedule
    .filter(g => g.played)
    .map(g => ({
      ...g,
      sortKey: g.week,
      label: `Week ${g.week}`,
    }));

  const playoffGamesData = playoffSchedule
    .filter(g => g.played)
    .map(g => {
      // Parse playoff code for display
      const prefix = g.code.substring(0, 2);
      let label = g.code;
      if (prefix === "KC") label = "Kingdom Cup";
      else if (prefix === "CS") label = "Castle Series";
      else if (prefix === "WC") label = "Wildcard";

      return {
        ...g,
        week: 1000 + (prefix === "KC" ? 3 : prefix === "CS" ? 2 : 1), // Sort playoffs after regular
        sortKey: 1000 + (prefix === "KC" ? 3 : prefix === "CS" ? 2 : 1),
        label,
      };
    });

  // Combine, sort by most recent, and transform
  const allGames = [...regularGames, ...playoffGamesData]
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 6)
    .map(g => {
      const homeInfo = teamMap.get(g.homeTeam);
      const awayInfo = teamMap.get(g.awayTeam);

      return {
        homeTeam: g.homeTeam,
        homeShort: homeInfo?.abbr || g.homeTeam.substring(0, 3).toUpperCase(),
        homeColor: homeInfo?.color || "#ffffff",
        homeEmblem: homeInfo?.emblemUrl || "",
        homeScore: g.homeScore || 0,
        awayTeam: g.awayTeam,
        awayShort: awayInfo?.abbr || g.awayTeam.substring(0, 3).toUpperCase(),
        awayColor: awayInfo?.color || "#ffffff",
        awayEmblem: awayInfo?.emblemUrl || "",
        awayScore: g.awayScore || 0,
        boxScoreUrl: g.boxScoreUrl,
        label: g.label,
      };
    });

  return (
    <SidebarHUDClient
      standings={standingsData}
      leaders={{
        batting: battingLeaders,
        homeRuns: hrLeaders,
        era: eraLeaders,
      }}
      recentGames={allGames}
    />
  );
}
