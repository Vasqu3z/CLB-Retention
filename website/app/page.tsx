import { getTeamRegistry } from "@/lib/sheets";
import HomeClient, { TeamData } from "./HomeClient";

// Current season - can be moved to env/config later
const CURRENT_SEASON = 1;

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

  return <HomeClient teams={activeTeams} season={CURRENT_SEASON} />;
}
