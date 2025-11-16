import { ReactNode } from 'react';
import { Database, Search, Calendar, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'database' | 'search' | 'calendar' | 'users';
  title: string;
  message?: string;
  children?: ReactNode;
}

export default function EmptyState({ icon = 'database', title, message, children }: EmptyStateProps) {
  const IconComponent = {
    database: Database,
    search: Search,
    calendar: Calendar,
    users: Users,
  }[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 glass-card">
      <div className="w-16 h-16 rounded-full bg-space-blue/30 flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-star-gray" />
      </div>
      <h3 className="text-xl font-display font-semibold text-star-white mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-star-gray text-center max-w-md mb-4">
          {message}
        </p>
      )}
      {children}
    </div>
  );
}
