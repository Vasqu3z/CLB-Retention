import { CardSkeleton } from '@/components/LoadingState';

export default function PlayoffsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-star-gray/20 rounded animate-pulse w-48" />
      <CardSkeleton count={4} />
    </div>
  );
}
