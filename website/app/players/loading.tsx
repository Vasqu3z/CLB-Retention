import RetroCardGridSkeleton from "@/components/ui/RetroCardGridSkeleton";

export default function PlayersLoading() {
  return <RetroCardGridSkeleton items={9} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />;
}
