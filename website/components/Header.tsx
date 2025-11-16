'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

export default function Header() {
  const pathname = usePathname();
  const teams = getActiveTeams();

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
        <div className="flex items-center h-16 gap-4">
          {/* Logo - Top left over sidebar */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none rounded-lg lg:w-80 flex-shrink-0"
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

          {/* Main content area - aligned with page content */}
          <div className="flex items-center justify-between flex-1">
            {/* Kingdom Cup Champions Logo */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-solar-gold/10 to-comet-yellow/10 border border-solar-gold/30">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-mono text-star-gray uppercase tracking-wider">Kingdom Cup Champions</span>
                <div className="w-32 h-16 relative">
                  <Image
                    src="/team-logos/PeachMonarchs-MSS.webp"
                    alt="Peach Monarchs - Season 1 Champions"
                    width={128}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Team Emblems */}
              <div className="hidden lg:flex items-center gap-4">
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
                  const isActive = pathname === item.href;
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
              </nav>
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
