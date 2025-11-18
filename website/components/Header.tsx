'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { LEAGUE_CONFIG, getActiveTeams } from "@/config/league";
import { getLeagueLogo, getTeamLogoPaths } from "@/lib/teamLogos";
import MobileNav from "./MobileNav";

const navItems = [
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/leaders", label: "Leaders" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
  { href: "/playoffs", label: "Playoffs" },
];

const toolsItems = [
  { href: "/tools/attributes", label: "⚾ Attribute Comparison" },
  { href: "/tools/stats", label: "📊 Stats Comparison" },
  { href: "/tools/chemistry", label: "⚡ Chemistry Tool" },
  { href: "/tools/lineup", label: "🏟️ Lineup Builder" },
];

export default function Header() {
  const pathname = usePathname() || '/';
  const teams = getActiveTeams();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const isToolsActive = pathname.startsWith('/tools');
  const activeTool = useMemo(
    () => toolsItems.find((tool) => pathname.startsWith(tool.href)),
    [pathname]
  );

  return (
    <header className="bg-space-navy/90 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-30" role="banner">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-nebula-orange focus:text-white focus:rounded-lg focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy"
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
                className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] group-focus:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] transition-all"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-display font-bold text-star-white leading-tight">
                {LEAGUE_CONFIG.shortName}
              </span>
              <span className="text-xs text-star-gray font-mono leading-tight">
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
                      className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] group-focus:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] transition-all"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 border-b-2
                    focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy
                    ${isActive
                      ? 'bg-nebula-orange/20 text-nebula-orange border-nebula-orange'
                      : 'text-star-gray hover:text-star-white hover:bg-space-blue/50 border-transparent'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowToolsDropdown(true)}
              onMouseLeave={() => setShowToolsDropdown(false)}
            >
              <button
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 border-b-2 flex items-center gap-2
                  focus:outline-none focus:ring-2 focus:ring-nebula-orange focus:ring-offset-2 focus:ring-offset-space-navy
                  ${isToolsActive
                    ? 'bg-nebula-orange/20 text-nebula-orange border-nebula-orange'
                    : 'text-star-gray hover:text-star-white hover:bg-space-blue/50 border-transparent'
                  }
                `}
              >
                Tools ▾
                {activeTool && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase rounded-full bg-nebula-orange/15 text-nebula-orange px-2 py-0.5">
                    {activeTool.label.replace(/^[^A-Za-z0-9]+\s?/, '')}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showToolsDropdown && (
                <div className="absolute top-full right-0 pt-2 w-56">
                  <div className="glass-card bg-space-navy/90 border border-cosmic-border/80 shadow-2xl overflow-hidden">
                    {toolsItems.map((tool) => {
                      const isActive = pathname.startsWith(tool.href);
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className={`
                            block px-4 py-3 text-sm transition-all duration-200
                            ${isActive
                              ? 'bg-nebula-orange/20 text-nebula-orange'
                              : 'text-star-gray hover:text-star-white hover:bg-space-blue/50'
                            }
                          `}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{tool.label}</span>
                            {isActive && (
                              <span className="text-[10px] font-semibold tracking-wide text-nebula-orange">
                                ACTIVE
                              </span>
                            )}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
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
