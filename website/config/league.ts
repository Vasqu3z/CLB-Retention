// League Configuration for Comets League Baseball (CLB)

export interface Team {
  name: string;
  slug: string;
  shortName: string;
  mascot: string;
  primaryColor: string;
  secondaryColor: string;
  active: boolean;
}

export interface LeagueConfig {
  name: string;
  shortName: string;
  sport: string;
  currentSeason: string;
  teams: Team[];
}

export const LEAGUE_CONFIG: LeagueConfig = {
  name: "Comets League Baseball",
  shortName: "CLB",
  sport: "Baseball",
  currentSeason: "1",
  teams: [
    // ACTIVE TEAMS
    {
      name: "Birdo Bows",
      slug: "birdo-bows",
      shortName: "Bows",
      mascot: "Birdo",
      primaryColor: "#FF69B4", // Pink
      secondaryColor: "#FFFFFF",
      active: true,
    },
    {
      name: "Bowser Monsters",
      slug: "bowser-monsters",
      shortName: "Monsters",
      mascot: "Bowser",
      primaryColor: "#FF6600", // Orange
      secondaryColor: "#FFCC00",
      active: true,
    },
    {
      name: "Daisy Flowers",
      slug: "daisy-flowers",
      shortName: "Flowers",
      mascot: "Daisy",
      primaryColor: "#FFD700", // Gold
      secondaryColor: "#FF8C00",
      active: true,
    },
    {
      name: "Diddy Kong Monkeys",
      slug: "diddy-kong-monkeys",
      shortName: "Monkeys",
      mascot: "Diddy Kong",
      primaryColor: "#D2691E", // Brown
      secondaryColor: "#FF0000",
      active: true,
    },
    {
      name: "DK Wilds",
      slug: "dk-wilds",
      shortName: "Wilds",
      mascot: "Donkey Kong",
      primaryColor: "#8B4513", // Brown
      secondaryColor: "#FF0000",
      active: true,
    },
    {
      name: "Mario Fireballs",
      slug: "mario-fireballs",
      shortName: "Fireballs",
      mascot: "Mario",
      primaryColor: "#FF0000", // Red
      secondaryColor: "#0000FF",
      active: true,
    },
    {
      name: "Peach Monarchs",
      slug: "peach-monarchs",
      shortName: "Monarchs",
      mascot: "Peach",
      primaryColor: "#FFB6C1", // Light Pink
      secondaryColor: "#FFD700",
      active: true,
    },
    {
      name: "Wario Muscles",
      slug: "wario-muscles",
      shortName: "Muscles",
      mascot: "Wario",
      primaryColor: "#FFFF00", // Yellow
      secondaryColor: "#800080",
      active: true,
    },

    // INACTIVE TEAMS
    {
      name: "Bowser Jr. Rookies",
      slug: "bowser-jr-rookies",
      shortName: "Rookies",
      mascot: "Bowser Jr.",
      primaryColor: "#32CD32", // Green
      secondaryColor: "#FF6600",
      active: false,
    },
    {
      name: "Luigi Knights",
      slug: "luigi-knights",
      shortName: "Knights",
      mascot: "Luigi",
      primaryColor: "#00FF00", // Green
      secondaryColor: "#0000FF",
      active: false,
    },
    {
      name: "Waluigi Spitballs",
      slug: "waluigi-spitballs",
      shortName: "Spitballs",
      mascot: "Waluigi",
      primaryColor: "#800080", // Purple
      secondaryColor: "#000000",
      active: false,
    },
    {
      name: "Yoshi Eggs",
      slug: "yoshi-eggs",
      shortName: "Eggs",
      mascot: "Yoshi",
      primaryColor: "#00FF00", // Green
      secondaryColor: "#FFFFFF",
      active: false,
    },
  ],
};

// Helper functions
export function getActiveTeams(): Team[] {
  return LEAGUE_CONFIG.teams.filter((team) => team.active);
}

export function getAllTeams(): Team[] {
  return LEAGUE_CONFIG.teams;
}

export function getTeamBySlug(slug: string): Team | undefined {
  return LEAGUE_CONFIG.teams.find((team) => team.slug === slug);
}

export function getTeamByName(name: string): Team | undefined {
  // Normalize the input name for matching (trim whitespace, normalize case)
  const normalizedInput = name.trim();

  // First try exact match
  let team = LEAGUE_CONFIG.teams.find((team) => team.name === normalizedInput);

  // If no exact match, try case-insensitive match
  if (!team) {
    team = LEAGUE_CONFIG.teams.find(
      (team) => team.name.toLowerCase() === normalizedInput.toLowerCase()
    );
  }

  // If still no match, try matching by shortName
  if (!team) {
    team = LEAGUE_CONFIG.teams.find(
      (team) => team.shortName.toLowerCase() === normalizedInput.toLowerCase()
    );
  }

  return team;
}
