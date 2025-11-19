import { forwardRef, type HTMLAttributes } from 'react';
import { cn, surfaceCardBaseClasses } from '@/lib/utils';

const SurfaceCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(surfaceCardBaseClasses, className)} {...props} />
  )
);

SurfaceCard.displayName = 'SurfaceCard';

export default SurfaceCard;
