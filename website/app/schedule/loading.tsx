import RetroCardGridSkeleton from "@/components/ui/RetroCardGridSkeleton";

export default function ScheduleLoading() {
  return <RetroCardGridSkeleton items={8} columns="grid-cols-1 lg:grid-cols-2" />;
}
