import { getAllPlayerAttributes } from '@/lib/sheets';
import LineupBuilder, { LineupPlayer } from './LineupBuilder';

export const revalidate = 60;

function toHexColor(color?: string) {
  if (!color) return '#00F3FF';
  if (color.startsWith('#')) return color;
  return '#00F3FF';
}

export default async function LineupBuilderPage() {
  const attributes = await getAllPlayerAttributes();

  const lineupPlayers: LineupPlayer[] = attributes.map((attr) => ({
    name: attr.name,
    teamColor: toHexColor(attr.miiColor),
    position: 'UTIL',
    stats: {
      avg: attr.battingAverage ? (attr.battingAverage / 100).toFixed(3).slice(1) : '.300',
      power: Math.round(attr.chargeHitPower ?? attr.battingOverall ?? 70),
      speed: Math.round(attr.speed ?? attr.speedOverall ?? 70),
      chemistry: [],
    },
  }));

  return <LineupBuilder players={lineupPlayers} />;
}

export const metadata = {
  title: 'Lineup Builder - Comets League Baseball',
  description: 'Build and optimize your lineup with interactive chemistry visualization',
};
