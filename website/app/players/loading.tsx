import { TableSkeleton } from '@/components/LoadingState';

export default function PlayersLoading() {
  return <TableSkeleton rows={15} columns={7} />;
}
