'use client';

import { useState } from 'react';
import { X, Menu } from 'lucide-react';
import SidebarScrollWrapper from './SidebarScrollWrapper';

interface SidebarMobileProps {
  children: React.ReactNode;
}

export default function SidebarMobile({ children }: SidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-surface-dark/90 backdrop-blur-md p-3 rounded-lg border border-comets-cyan/30 hover:border-comets-cyan transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="relative h-full w-80 bg-surface-dark/95 backdrop-blur-glass border-r border-comets-cyan/20 overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 bg-surface-light/90 p-2 rounded-lg hover:bg-comets-cyan/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Sidebar Content */}
          {children}
        </div>
      </div>

      {/* Desktop Sidebar - Always Visible */}
      <div className="hidden lg:block">
        <SidebarScrollWrapper className="fixed left-0 top-16 w-80 bg-surface-dark/80 backdrop-blur-glass border-r border-comets-cyan/20 z-20" style={{ height: 'calc(100vh - 4rem)' }}>
          {children}
        </SidebarScrollWrapper>
      </div>
    </>
  );
}
