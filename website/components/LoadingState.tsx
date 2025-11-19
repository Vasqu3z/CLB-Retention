import { Loader2 } from 'lucide-react';
import SurfaceCard from '@/components/SurfaceCard';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  variant?: 'spinner' | 'table';
  tableColumns?: number;
  tableRows?: number;
}

export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  variant = 'spinner',
  tableColumns,
  tableRows,
}: LoadingStateProps) {
  if (variant === 'table') {
    const skeleton = <TableSkeleton columns={tableColumns} rows={tableRows} />;

    if (fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-5xl">{skeleton}</div>
        </div>
      );
    }

    return skeleton;
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={`${sizeClasses[size]} text-nebula-orange animate-spin`}
        strokeWidth={2.5}
      />
      <p className={`${textSizeClasses[size]} text-star-gray font-mono animate-pulse`}>
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <SurfaceCard className="py-16 px-4">{content}</SurfaceCard>;
}

// Cosmic Spinner - Centered loading indicator
export function CosmicSpinner({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-nebula-orange/20 blur-xl animate-pulse" />

        {/* Spinning loader */}
        <Loader2
          className="w-16 h-16 text-nebula-orange animate-spin relative z-10"
          strokeWidth={2}
        />
      </div>

      <p className="mt-6 text-star-gray font-mono text-sm animate-pulse">
        {message}
      </p>
    </div>
  );
}

export function CardSkeleton() {
  return <CosmicSpinner message="Loading data..." />;
}

export { TableSkeleton };
