import Link from "next/link";
import Image from "next/image";
import { LEAGUE_CONFIG, getActiveTeams } from "@/config/league";
import { getLeagueLogo, getTeamLogoPaths } from "@/lib/teamLogos";
import { Trophy, TrendingUp, Calendar, Users, Target, BarChart3 } from "lucide-react";

const navCards = [
  {
    href: "/standings",
    title: "Standings",
    description: "View current league standings and team records",
    icon: Trophy,
    gradient: "from-nebula-orange/20 to-solar-gold/20",
    borderColor: "border-nebula-orange/50",
    iconColor: "text-nebula-orange",
  },
  {
    href: "/leaders",
    title: "League Leaders",
    description: "Top performers in batting, pitching, and fielding",
    icon: TrendingUp,
    gradient: "from-comet-yellow/20 to-nebula-coral/20",
    borderColor: "border-comet-yellow/50",
    iconColor: "text-comet-yellow",
  },
  {
    href: "/schedule",
    title: "Schedule",
    description: "View game schedule and results",
    icon: Calendar,
    gradient: "from-nebula-cyan/20 to-nebula-teal/20",
    borderColor: "border-nebula-cyan/50",
    iconColor: "text-nebula-cyan",
  },
  {
    href: "/teams",
    title: "Teams",
    description: "Browse team rosters and statistics",
    icon: Users,
    gradient: "from-star-pink/20 to-nebula-coral/20",
    borderColor: "border-star-pink/50",
    iconColor: "text-star-pink",
  },
  {
    href: "/players",
    title: "Players",
    description: "View individual player statistics",
    icon: Target,
    gradient: "from-nebula-teal/20 to-nebula-cyan/20",
    borderColor: "border-nebula-teal/50",
    iconColor: "text-nebula-teal",
  },
  {
    href: "/playoffs",
    title: "Playoffs",
    description: "Playoff bracket and postseason results",
    icon: BarChart3,
    gradient: "from-solar-gold/20 to-comet-yellow/20",
    borderColor: "border-solar-gold/50",
    iconColor: "text-solar-gold",
  },
];

export default function Home() {
  const teams = getActiveTeams();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 relative">
        {/* Decorative glow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-96 h-96 bg-nebula-orange/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 relative">
              <Image
                src={getLeagueLogo()}
                alt="CLB Logo"
                width={128}
                height={128}
                className="object-contain drop-shadow-[0_0_20px_rgba(255,107,53,0.6)]"
                priority
              />
            </div>
          </div>

          <h1 className="text-6xl lg:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-nebula-orange via-solar-gold to-comet-yellow bg-clip-text text-transparent">
            {LEAGUE_CONFIG.name}
          </h1>

          <p className="text-xl text-star-gray font-mono mb-2">
            Mission Control • Season {LEAGUE_CONFIG.currentSeason}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-star-dim">
            <div className="w-2 h-2 rounded-full bg-nebula-teal animate-pulse" />
            <span className="font-mono">System Online</span>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-6 text-star-white flex items-center gap-2">
          <span className="text-nebula-orange">›</span> Quick Access
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`
                  group relative p-6 rounded-xl border ${card.borderColor}
                  bg-gradient-to-br ${card.gradient}
                  hover:scale-[1.02] transition-all duration-300
                  backdrop-blur-sm
                `}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent via-white/5 to-transparent" />

                <div className="relative z-10">
                  <Icon className={`w-8 h-8 ${card.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="text-xl font-display font-semibold mb-2 text-star-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-star-gray">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Team Constellation */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-6 text-star-white flex items-center gap-2">
          <span className="text-solar-gold">›</span> Team Constellation
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {teams.map((team) => {
            const logos = getTeamLogoPaths(team.name);
            return (
              <Link
                key={team.slug}
                href={`/teams/${team.slug}`}
                className="group p-4 rounded-xl bg-space-blue/30 border border-cosmic-border hover:border-nebula-orange/50 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={logos.emblem}
                      alt={team.name}
                      width={64}
                      height={64}
                      className="object-contain group-hover:drop-shadow-[0_0_12px_rgba(255,107,53,0.6)] transition-all"
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className="text-sm font-semibold group-hover:text-nebula-orange transition-colors"
                      style={{ color: team.primaryColor }}
                    >
                      {team.shortName}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Status Footer */}
      <section className="text-center py-8 border-t border-cosmic-border">
        <div className="text-sm text-star-dim font-mono space-y-1">
          <p>Data powered by Google Sheets • Built with Next.js</p>
          <p className="text-xs">
            <span className="text-nebula-orange">▸</span> Real-time stats synchronized every 60 seconds
          </p>
        </div>
      </section>
    </div>
  );
}
