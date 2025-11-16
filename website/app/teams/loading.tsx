import { CardSkeleton } from '@/components/LoadingState';

export default function TeamsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-star-gray/20 rounded animate-pulse w-48" />
      <CardSkeleton count={8} />
    </div>
  );
}
