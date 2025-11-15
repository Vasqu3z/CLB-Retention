// Team Logo Mapping Utilities

export interface TeamLogoPaths {
  full: string;    // Full logo with text
  emblem: string;  // Compact emblem without text
}

/**
 * Manual mapping of team names to logo filenames
 * The files don't follow a consistent pattern, so we map them explicitly
 */
const TEAM_LOGO_MAP: Record<string, { full: string; emblem: string }> = {
  "Birdo Bows": {
    full: "BirdoBows-MSS.png",
    emblem: "MSS-Emblem-Birdo_Bows.png"
  },
  "Bowser Monsters": {
    full: "BowserMonsters-MSS.png",
    emblem: "MSS-Emblem-Bowser_Monsters.png"
  },
  "Daisy Flowers": {
    full: "DaisyFlowers-MSS.png",
    emblem: "MSS-Emblem-Daisy_Flowers.png"
  },
  "Diddy Kong Monkeys": {
    full: "DiddyMonkeys-MSS.png",
    emblem: "MSS-Emblem-Diddy_Kong_Monkeys.png"
  },
  "DK Wilds": {
    full: "DKWilds-MSS.png",
    emblem: "MSS-Emblem-DK_Wilds.png"
  },
  "Mario Fireballs": {
    full: "MarioFireballs-MSS.png",
    emblem: "MSS-Emblem-Mario_Fireballs.png"
  },
  "Peach Monarchs": {
    full: "PeachMonarchs-MSS.png",
    emblem: "MSS-Emblem-Peach_Monarchs.png"
  },
  "Wario Muscles": {
    full: "WarioMuscles-MSS.png",
    emblem: "MSS-Emblem-Wario_Muscles.png"
  },
  // Inactive teams
  "Bowser Jr. Rookies": {
    full: "BowserJrRookies-MSS.png",
    emblem: "MSS-Emblem-Bowser_Jr_Rookies.png"
  },
  "Luigi Knights": {
    full: "LuigiKnights-MSS.png",
    emblem: "MSS-Emblem-Luigi_Knights.png"
  },
  "Waluigi Spitballs": {
    full: "WaluigiSpitballs-MSS.png",
    emblem: "MSS-Emblem-Waluigi_Spitballs.png"
  },
  "Yoshi Eggs": {
    full: "YoshiEggs-MSS.png",
    emblem: "MSS-Emblem-Yoshi_Eggs.png"
  },
};

/**
 * Maps team name to logo file paths
 * @param teamName - The full team name (e.g., "Birdo Bows")
 * @returns Object with full and emblem logo paths
 */
export function getTeamLogoPaths(teamName: string): TeamLogoPaths {
  const mapping = TEAM_LOGO_MAP[teamName];

  if (!mapping) {
    console.warn(`No logo mapping found for team: ${teamName}`);
    // Fallback to a default or empty image
    return {
      full: '/team-logos/blank',
      emblem: '/team-logos/blank',
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
