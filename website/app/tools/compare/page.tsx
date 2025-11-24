import { getAllPlayers } from '@/lib/sheets';
import { getTeamByName } from '@/config/league';
import CompareClient, { ComparePlayer } from './CompareClient';

export const revalidate = 60;

function buildPlayer(player?: { name: string; team: string; avg?: string; hr?: number; ops?: string }, fallbackColor: string = '#00F3FF'): ComparePlayer {
  if (!player) {
    return {
      name: 'Player',
      team: 'Unknown',
      color: fallbackColor,
      stats: { avg: '.000', hr: 0, ops: '.000' },
    };
  }
  const team = getTeamByName(player.team);
  return {
    name: player.name,
    team: player.team,
    color: team?.primaryColor ?? fallbackColor,
    stats: {
      avg: player.avg ?? '.000',
      hr: player.hr ?? 0,
      ops: player.ops ?? '.000',
    },
  };
}

export default async function ComparePage() {
  const players = await getAllPlayers(false);
  const [first, second] = players;

  const playerA = buildPlayer(first, '#F4D03F');
  const playerB = buildPlayer(second, '#9B59B6');

  return <CompareClient playerA={playerA} playerB={playerB} />;
}
