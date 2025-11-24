import { getAllPlayers } from '@/lib/sheets';
import { PlayersClient } from './PlayersClient';

export const revalidate = 60;

export default async function PlayersPage() {
  const players = await getAllPlayers(false);

  return <PlayersClient players={players} />;
}
