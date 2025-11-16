'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface SidebarScrollWrapperProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SidebarScrollWrapper({ children, className = '', style = {} }: SidebarScrollWrapperProps) {
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
      sidebar.style.overflowY = 'auto'; // Keep auto to allow scrollbar
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isHoveringRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    sidebar.addEventListener('mouseenter', handleMouseEnter);
    sidebar.addEventListener('mouseleave', handleMouseLeave);
    sidebar.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      sidebar.removeEventListener('mouseenter', handleMouseEnter);
      sidebar.removeEventListener('mouseleave', handleMouseLeave);
      sidebar.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={sidebarRef} className={className} style={{ ...style, overflowY: 'auto' }}>
      {children}
    </div>
  );
}
