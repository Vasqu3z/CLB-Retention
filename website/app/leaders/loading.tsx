import { TableSkeleton } from '@/components/LoadingState';

export default function LeadersLoading() {
  return <TableSkeleton rows={10} columns={8} />;
}
