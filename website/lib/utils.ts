import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a player name to a URL-friendly slug
 * Example: "Mario" → "mario", "Luigi Jr." → "luigi-jr"
 */
export function playerNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Formats a stat value for display
 */
export function formatStat(value: any, decimals: number = 0): string {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  return String(value);
}
