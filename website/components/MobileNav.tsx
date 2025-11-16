'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/leaders", label: "Leaders" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
  { href: "/playoffs", label: "Playoffs" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg border border-cosmic-border bg-space-blue/30 hover:bg-space-blue/50 hover:border-nebula-orange/50 transition-all duration-300"
        aria-label="Toggle menu"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-space-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-space-navy/95 backdrop-blur-xl border-l border-cosmic-border z-50 md:hidden"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-cosmic-border">
              <h2 className="text-xl font-display font-bold text-star-white">
                Navigation
              </h2>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-space-blue/50 transition-all duration-300"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-star-white" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6">
              <ul className="space-y-2">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`
                          block px-4 py-3 rounded-lg font-display font-semibold text-lg transition-all duration-300
                          ${isActive
                            ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                            : 'text-star-gray hover:text-star-white hover:bg-space-blue/50 hover:translate-x-1'
                          }
                        `}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-cosmic-border">
              <p className="text-xs text-star-dim font-mono text-center">
                Comets League Baseball
              </p>
              <p className="text-xs text-star-dim font-mono text-center mt-1">
                Season 2025
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
