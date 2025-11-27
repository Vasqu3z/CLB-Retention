// Team Logo Mapping Utilities
// Updated to read from Google Sheets Team Registry

import { getTeamRegistry, type TeamRegistryEntry } from "./sheets";

export interface TeamLogoPaths {
  full: string;    // Full logo with text
  emblem: string;  // Compact emblem without text
}

/**
 * DEPRECATED: Use team registry data directly instead
 * Manual mapping of team names to logo filenames
 * The files don't follow a consistent pattern, so we map them explicitly
 *
 * @deprecated This hardcoded map is being phased out in favor of Google Sheets data
 */
const TEAM_LOGO_MAP: Record<string, { full: string; emblem: string }> = {
  "Birdo Bows": {
    full: "BirdoBows-MSS.webp",
    emblem: "MSS-Emblem-Birdo_Bows.webp"
  },
  "Bowser Monsters": {
    full: "BowserMonsters-MSS.webp",
    emblem: "MSS-Emblem-Bowser_Monsters.webp"
  },
  "Daisy Flowers": {
    full: "DaisyFlowers-MSS.webp",
    emblem: "MSS-Emblem-Daisy_Flowers.webp"
  },
  "Diddy Kong Monkeys": {
    full: "DiddyMonkeys-MSS.webp",
    emblem: "MSS-Emblem-Diddy_Kong_Monkeys.webp"
  },
  "DK Wilds": {
    full: "DKWilds-MSS.webp",
    emblem: "MSS-Emblem-DK_Wilds.webp"
  },
  "Mario Fireballs": {
    full: "MarioFireballs-MSS.webp",
    emblem: "MSS-Emblem-Mario_Fireballs.webp"
  },
  "Peach Monarchs": {
    full: "PeachMonarchs-MSS.webp",
    emblem: "MSS-Emblem-Peach_Monarchs.webp"
  },
  "Wario Muscles": {
    full: "WarioMuscles-MSS.webp",
    emblem: "MSS-Emblem-Wario_Muscles.webp"
  },
  // Inactive teams
  "Bowser Jr. Rookies": {
    full: "BowserJrRookies-MSS.webp",
    emblem: "MSS-Emblem-Bowser_Jr_Rookies.webp"
  },
  "Luigi Knights": {
    full: "LuigiKnights-MSS.webp",
    emblem: "MSS-Emblem-Luigi_Knights.webp"
  },
  "Waluigi Spitballs": {
    full: "WaluigiSpitballs-MSS.webp",
    emblem: "MSS-Emblem-Waluigi_Spitballs.webp"
  },
  "Yoshi Eggs": {
    full: "YoshiEggs-MSS.webp",
    emblem: "MSS-Emblem-Yoshi_Eggs.webp"
  },
};

/**
 * Fetches team logos from Google Sheets Team Registry
 * Returns a Map of team names to their logo paths
 *
 * @returns Promise<Map<string, TeamLogoPaths>>
 */
export async function getTeamLogosFromRegistry(): Promise<Map<string, TeamLogoPaths>> {
  const teamRegistry = await getTeamRegistry();

  const logosMap = new Map<string, TeamLogoPaths>();

  for (const team of teamRegistry) {
    logosMap.set(team.teamName, {
      full: team.logoUrl || "",
      emblem: team.emblemUrl || ""
    });
  }

  return logosMap;
}

/**
 * Helper function to extract logo paths from a TeamRegistryEntry
 * Use this when you already have team registry data
 *
 * @param team - TeamRegistryEntry from getTeamRegistry()
 * @returns TeamLogoPaths object
 */
export function getLogoPathsFromTeam(team: TeamRegistryEntry): TeamLogoPaths {
  return {
    full: team.logoUrl || "",
    emblem: team.emblemUrl || ""
  };
}

/**
 * DEPRECATED: Maps team name to logo file paths using hardcoded map
 * Prefer using getTeamLogosFromRegistry() or team registry data directly
 *
 * @deprecated Use getTeamLogosFromRegistry() or getLogoPathsFromTeam() instead
 * @param teamName - The full team name (e.g., "Birdo Bows")
 * @returns Object with full and emblem logo paths
 */
export function getTeamLogoPaths(teamName: string): TeamLogoPaths {
  const mapping = TEAM_LOGO_MAP[teamName];

  if (!mapping) {
    console.warn(`No logo mapping found for team: ${teamName}. Consider using team registry data instead.`);
    // Fallback to empty paths
    return {
      full: '',
      emblem: '',
    };
  }

  return {
    full: `/team-logos/${mapping.full}`,
    emblem: `/team-logos/${mapping.emblem}`,
  };
}

/**
 * Get league logo path
 */
export function getLeagueLogo(): string {
  return '/CLB II.png';
}
