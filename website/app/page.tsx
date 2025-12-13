import { getTeamRegistry } from "@/lib/sheets";
import HomeClient, { TeamData } from "./HomeClient";
import { LEAGUE_CONFIG } from "@/config/league";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Helper to convert team name to URL slug
function teamNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default async function HomePage() {
  // Fetch team registry and filter to active teams only
  const teamRegistry = await getTeamRegistry();

  const activeTeams: TeamData[] = teamRegistry
    .filter(team => team.status.toLowerCase() === 'active')
    .map(team => ({
      emblem: team.emblemUrl,
      slug: teamNameToSlug(team.teamName),
      name: team.teamName,
    }));

  return <HomeClient teams={activeTeams} season={parseInt(LEAGUE_CONFIG.currentSeason)} />;
}
