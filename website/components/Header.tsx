'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { LEAGUE_CONFIG, getActiveTeams } from "@/config/league";
import { getLeagueLogo, getTeamLogoPaths } from "@/lib/teamLogos";
import MobileNav from "./MobileNav";
import SurfaceCard from "@/components/SurfaceCard";

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

export default function Header() {
  const pathname = usePathname();
  const teams = getActiveTeams();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isToolsActive = pathname.startsWith('/tools');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowToolsDropdown(false);
      }
    };

    if (showToolsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsDropdown]);

  // Handle keyboard navigation
  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowToolsDropdown(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowToolsDropdown(!showToolsDropdown);
    }
  };

  return (
    <header className="bg-surface-dark/90 backdrop-blur-md border-b border-comets-cyan/20 sticky top-0 z-30" role="banner">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-comets-cyan focus:text-background focus:rounded-lg focus:ring-2 focus:ring-comets-cyan focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to main content
      </a>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none rounded-lg"
            aria-label="Comets League Baseball Home"
          >
            <div className="w-12 h-12 relative flex items-center justify-center flex-shrink-0">
              <Image
                src={getLeagueLogo()}
                alt="CLB Logo"
                width={48}
                height={48}
                className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] group-focus:drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] transition-all"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-display font-bold text-foreground leading-tight">
                {LEAGUE_CONFIG.shortName}
              </span>
              <span className="text-xs text-comets-cyan font-mono leading-tight">
                Season {LEAGUE_CONFIG.currentSeason}
              </span>
            </div>
          </Link>

          {/* Team Emblems */}
          <div className="hidden lg:flex items-center gap-4 mx-4">
            {teams.map((team) => {
              const logos = getTeamLogoPaths(team.name);
              return (
                <Link
                  key={team.slug}
                  href={`/teams/${team.slug}`}
                  className="group focus:outline-none rounded-lg"
                  aria-label={team.name}
                >
                  <div className="w-8 h-8 relative flex items-center justify-center">
                    <Image
                      src={logos.emblem}
                      alt={team.name}
                      width={32}
                      height={32}
                      loading="lazy"
                      className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] group-focus:drop-shadow-[0_0_12px_rgba(0,243,255,0.8)] transition-all"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 border-b-2
                    focus:outline-none focus:ring-2 focus:ring-comets-cyan focus:ring-offset-2 focus:ring-offset-background
                    ${isActive
                      ? 'bg-comets-cyan/20 text-comets-cyan border-comets-cyan'
                      : 'text-foreground/60 hover:text-foreground hover:bg-surface-light/50 border-transparent'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setShowToolsDropdown(true)}
              onMouseLeave={() => setShowToolsDropdown(false)}
            >
              <button
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                onKeyDown={handleDropdownKeyDown}
                aria-expanded={showToolsDropdown}
                aria-haspopup="true"
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 border-b-2
                  focus:outline-none focus:ring-2 focus:ring-comets-cyan focus:ring-offset-2 focus:ring-offset-background
                  ${isToolsActive
                    ? 'bg-comets-cyan/20 text-comets-cyan border-comets-cyan'
                    : 'text-foreground/60 hover:text-foreground hover:bg-surface-light/50 border-transparent'
                  }
                `}
              >
                References ▾
              </button>

              {/* Dropdown Menu */}
              {showToolsDropdown && (
                <div className="absolute top-full right-0 pt-2 w-56">
                  <SurfaceCard className="bg-surface-dark/95 border border-comets-cyan/30 shadow-2xl overflow-hidden" role="menu">
                    {toolsItems.map((tool) => {
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          role="menuitem"
                          onClick={() => setShowToolsDropdown(false)}
                          className={`
                            block px-4 py-3 text-sm transition-all duration-200
                            ${isActive
                              ? 'bg-comets-cyan/20 text-comets-cyan'
                              : 'text-foreground/60 hover:text-foreground hover:bg-surface-light/50'
                            }
                          `}
                        >
                          {tool.label}
                        </Link>
                      );
                    })}
                  </SurfaceCard>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
