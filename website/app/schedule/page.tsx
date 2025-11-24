import { getSchedule } from '@/lib/sheets';
import { ScheduleClient } from './ScheduleClient';

export const revalidate = 60;

export default async function SchedulePage() {
  const schedule = await getSchedule();

  return <ScheduleClient schedule={schedule} />;
}
