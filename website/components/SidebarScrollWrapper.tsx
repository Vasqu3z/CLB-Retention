'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface SidebarScrollWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function SidebarScrollWrapper({ children, className = '' }: SidebarScrollWrapperProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
      sidebar.style.overflowY = 'auto';
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      sidebar.style.overflowY = 'hidden';
    };

    sidebar.addEventListener('mouseenter', handleMouseEnter);
    sidebar.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      sidebar.removeEventListener('mouseenter', handleMouseEnter);
      sidebar.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={sidebarRef} className={className} style={{ overflowY: 'hidden' }}>
      {children}
    </div>
  );
}
