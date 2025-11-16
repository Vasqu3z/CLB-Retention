'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LEAGUE_CONFIG } from "@/config/league";
import { getLeagueLogo } from "@/lib/teamLogos";

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

  return (
    <header className="bg-space-navy/90 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 relative flex-shrink-0">
              <Image
                src={getLeagueLogo()}
                alt="CLB Logo"
                width={56}
                height={56}
                className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.8)] transition-all"
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
