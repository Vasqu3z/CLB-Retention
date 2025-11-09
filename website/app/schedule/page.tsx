import { getSchedule } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import ScheduleView from './ScheduleView';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function SchedulePage() {
  const schedule = await getSchedule();
  const teams = getActiveTeams();

  return <ScheduleView schedule={schedule} teams={teams} />;
}
