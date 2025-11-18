import { ReactNode } from 'react';

interface ControlShelfProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function ControlShelf({ title, description, children, className }: ControlShelfProps) {
  return (
    <section
      className={`glass-card border border-cosmic-border/70 bg-space-navy/80 shadow-[0_8px_30px_rgba(0,0,0,0.45)] px-4 py-4 lg:px-6 lg:py-5 space-y-3 lg:space-y-4 lg:sticky lg:top-24 z-20 ${className || ''}`.trim()}
      aria-label={title || 'Data controls'}
    >
      {(title || description) && (
        <header className="space-y-1">
          {title && (
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-nebula-orange">{title}</p>
          )}
          {description && (
            <p className="text-sm text-star-gray/80">{description}</p>
          )}
        </header>
      )}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-stretch">
        {children}
      </div>
    </section>
  );
}
