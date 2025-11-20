'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FocusTrap from 'focus-trap-react';
import useReducedMotion from '@/hooks/useReducedMotion';
import { drawerVariants, navItemVariants, overlayVariants } from './animations/motionVariants';

const navItems = [
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/leaders", label: "Leaders" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
  { href: "/playoffs", label: "Playoffs" },
];

const toolsItems = [
  { href: "/tools/attributes", label: "Attribute Comparison" },
  { href: "/tools/stats", label: "Stats Comparison" },
  { href: "/tools/chemistry", label: "Chemistry Comparison" },
  { href: "/tools/lineup", label: "Lineup Builder" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg border border-cosmic-border bg-space-blue/30 hover:bg-space-blue/50 hover:border-nebula-orange/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-star-white" />
        ) : (
          <Menu className="w-6 h-6 text-star-white" />
        )}
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <FocusTrap
            active={isOpen}
            focusTrapOptions={{
              allowOutsideClick: true,
              clickOutsideDeactivates: true,
              escapeDeactivates: false,
              onDeactivate: closeMenu,
            }}
          >
            <div className="md:hidden">
              <motion.div
                variants={overlayVariants(prefersReducedMotion)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-space-black/80 backdrop-blur-sm z-40"
                onClick={closeMenu}
              />

              {/* Slide-in Menu */}
              <motion.div
                id="mobile-menu"
                variants={drawerVariants(prefersReducedMotion)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-0 right-0 h-full w-80 bg-space-navy/95 backdrop-blur-xl border-l border-cosmic-border z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-cosmic-border">
                  <h2 className="text-xl font-display font-bold text-star-white">
                    Navigation
                  </h2>
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-lg hover:bg-space-blue/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nebula-orange"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-star-white" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]" role="navigation" aria-label="Mobile navigation">
                  <ul className="space-y-2">
                    {navItems.map((item, idx) => {
                      const isActive = pathname === item.href;
                      const itemVariants = navItemVariants(prefersReducedMotion);
                      return (
                        <motion.li
                          key={item.href}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx * 0.05}
                        >
                          <Link
                            href={item.href}
                            onClick={closeMenu}
                            aria-current={isActive ? 'page' : undefined}
                            className={`
                              block px-4 py-3 rounded-lg font-display font-semibold text-lg transition-all duration-300
                              focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy
                              ${isActive
                                ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                                : 'text-star-gray hover:text-star-white hover:bg-space-blue/50 hover:translate-x-1 motion-reduce:hover:translate-x-0 motion-reduce:transition-none'
                              }
                            `}
                          >
                            {item.label}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>

                  {/* References Section */}
                  <div className="mt-6 pt-6 border-t border-cosmic-border">
                    <h3 className="px-4 mb-2 text-xs font-bold text-star-dim uppercase tracking-wider">
                      References
                    </h3>
                    <ul className="space-y-2">
                      {toolsItems.map((item, idx) => {
                        const isActive = pathname === item.href;
                        const itemVariants = navItemVariants(prefersReducedMotion);
                        return (
                          <motion.li
                            key={item.href}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={(navItems.length + idx) * 0.05}
                          >
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              aria-current={isActive ? 'page' : undefined}
                              className={`
                                block px-4 py-3 rounded-lg font-display font-semibold text-base transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy
                                ${isActive
                                  ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                                  : 'text-star-gray hover:text-star-white hover:bg-space-blue/50 hover:translate-x-1 motion-reduce:hover:translate-x-0 motion-reduce:transition-none'
                                }
                              `}
                            >
                              {item.label}
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-cosmic-border">
                  <p className="text-xs text-star-dim font-mono text-center">
                    Comets League Baseball
                  </p>
                  <p className="text-xs text-star-dim font-mono text-center mt-1">
                    Season 1
                  </p>
                </div>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
}
