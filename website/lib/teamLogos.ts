// Team Logo Mapping Utilities

export interface TeamLogoPaths {
  full: string;    // Full logo with text
  emblem: string;  // Compact emblem without text
}

/**
 * Maps team name to logo file paths
 * Logo naming convention:
 * - Full: TeamName-MSS.png (e.g., BirdoBows-MSS.png)
 * - Emblem: MSS-Emblem-Team_Name.png (e.g., MSS-Emblem-Birdo_Bows.png)
 */
export function getTeamLogoPaths(teamName: string): TeamLogoPaths {
  // Create file-safe name by removing spaces and special characters
  const fileNameBase = teamName
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');

  // Create emblem name with underscores
  const emblemName = teamName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

  return {
    full: `/team-logos/${fileNameBase}-MSS.png`,
    emblem: `/team-logos/MSS-Emblem-${emblemName}.png`,
  };
}

/**
 * Get league logo path
 */
export function getLeagueLogo(): string {
  return '/CLB II.png';
}
