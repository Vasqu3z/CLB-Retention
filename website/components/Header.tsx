'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LEAGUE_CONFIG } from "@/config/league";
import { getLeagueLogo } from "@/lib/teamLogos";

const navItems = [
  { href: "/standings", label: "Standings" },
  { href: "/leaders", label: "Leaders" },
  { href: "/schedule", label: "Schedule" },
  { href: "/playoffs", label: "Playoffs" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-space-navy/90 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative">
              <Image
                src={getLeagueLogo()}
                alt="CLB Logo"
                width={40}
                height={40}
                className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] transition-all"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-star-white">
                {LEAGUE_CONFIG.shortName}
              </span>
              <span className="text-xs text-star-gray font-mono">
                Season {LEAGUE_CONFIG.currentSeason}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all border-b-2
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

          {/* Mobile Navigation - Placeholder for now */}
          <div className="md:hidden">
            {/* Mobile nav will be handled by sidebar on mobile */}
          </div>
        </div>
      </div>
    </header>
  );
}
