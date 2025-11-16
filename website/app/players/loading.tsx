import { TableSkeleton } from '@/components/LoadingState';

export default function PlayersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-star-gray/20 rounded animate-pulse w-48" />
      <TableSkeleton rows={15} columns={7} />
    </div>
  );
}
