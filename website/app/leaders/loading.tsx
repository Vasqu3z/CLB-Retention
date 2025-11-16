import { TableSkeleton } from '@/components/LoadingState';

export default function LeadersLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 bg-star-gray/20 rounded animate-pulse w-64" />
      <div className="space-y-4">
        <div className="h-6 bg-star-gray/20 rounded animate-pulse w-40" />
        <TableSkeleton rows={10} columns={8} />
      </div>
    </div>
  );
}
