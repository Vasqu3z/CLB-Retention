import { TableSkeleton } from '@/components/LoadingState';

export default function StandingsLoading() {
  return <TableSkeleton rows={8} columns={10} />;
}
