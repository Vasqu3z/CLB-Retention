import { getSchedule } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import ScheduleView from './ScheduleView';
import FadeIn from "@/components/animations/FadeIn";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function SchedulePage() {
  const schedule = await getSchedule();
  const teams = getActiveTeams();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn delay={0} direction="down">
        <div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-nebula-cyan to-star-pink bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Game Schedule
          </h1>
          <p className="text-star-gray font-mono text-shadow">
            Regular season matchups and results
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15} direction="up">
        <ScheduleView schedule={schedule} teams={teams} />
      </FadeIn>
    </div>
  );
}
