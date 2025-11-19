import Link from "next/link";
import Image from "next/image";
import { LEAGUE_CONFIG } from "@/config/league";
import { getLeagueLogo } from "@/lib/teamLogos";
import { getStandings, getSchedule, getAllPlayers } from "@/lib/sheets";
import { Trophy, TrendingUp, Calendar, Users, BarChart3 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import FeaturedContentCarousel from "@/components/FeaturedContentCarousel";
import LeagueStatsTicker from "@/components/LeagueStatsTicker";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const quickAccessCards = [
  {
    href: "/standings",
    title: "Standings",
    icon: Trophy,
    gradient: "from-field-green/30 to-transparent",
    borderColor: "border-field-green/60",
    iconColor: "text-field-green",
  },
  {
    href: "/leaders",
    title: "Leaders",
    icon: TrendingUp,
    gradient: "from-solar-gold/25 to-transparent",
    borderColor: "border-solar-gold/60",
    iconColor: "text-solar-gold",
  },
  {
    href: "/schedule",
    title: "Schedule",
    icon: Calendar,
    gradient: "from-cosmic-purple/25 to-transparent",
    borderColor: "border-cosmic-purple/60",
    iconColor: "text-cosmic-purple",
  },
  {
    href: "/teams",
    title: "Teams",
    icon: Users,
    gradient: "from-nebula-orange/20 to-transparent",
    borderColor: "border-nebula-orange/50",
    iconColor: "text-nebula-orange",
  },
];

export default async function Home() {
  // Fetch data for carousel and ticker
  const [standings, schedule, allPlayers] = await Promise.all([
    getStandings(false),
    getSchedule(),
    getAllPlayers(false),
  ]);

  // Get recent completed games
  const recentGames = schedule
    .filter(game => game.played)
    .reverse()
    .slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Enhanced Hero Section */}
      <section className="relative py-20">
        {/* Floating baseball stitches background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 border-2 border-field-green rounded-full border-dashed animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        <FadeIn delay={0} direction="down" duration={0.9}>
          <div className="relative z-10 text-center">
            {/* Logo with enhanced pulsing glow */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-field-green/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-0 bg-nebula-orange/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="relative w-48 h-48">
                  <Image
                    src={getLeagueLogo()}
                    alt="CLB Logo"
                    width={192}
                    height={192}
                    className="object-contain drop-shadow-[0_0_40px_rgba(45,95,63,0.9)]"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Title with enhanced gradient */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight bg-gradient-to-r from-nebula-orange via-nebula-coral to-cosmic-purple bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {LEAGUE_CONFIG.name}
            </h1>

            <div className="flex flex-col items-center gap-4">
              <p className="text-3xl text-vintage-cream font-display font-semibold tracking-wide text-shadow-strong">
                Season {LEAGUE_CONFIG.currentSeason}
              </p>

              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-field-green/15 border-2 border-field-green/40 backdrop-blur-sm">
                <div className="w-4 h-4 rounded-full bg-nebula-teal animate-pulse shadow-[0_0_16px_rgba(0,212,255,0.9)]" />
                <span className="font-display font-bold text-lg text-nebula-teal tracking-wide">
                  LIVE STATS • UPDATING EVERY 60s
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Featured Content Carousel */}
      <FadeIn delay={0.2} direction="up">
        <section>
          <h2 className="text-3xl font-display font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-nebula-orange to-solar-gold bg-clip-text text-transparent">
              Featured Highlights
            </span>
          </h2>
          <FeaturedContentCarousel
            standings={standings}
            recentGames={recentGames}
            allPlayers={allPlayers}
          />
        </section>
      </FadeIn>

      {/* Live League Stats Ticker */}
      <FadeIn delay={0.4} direction="up">
        <LeagueStatsTicker
          standings={standings}
          allPlayers={allPlayers}
        />
      </FadeIn>

      {/* Quick Access Navigation */}
      <FadeIn delay={0.6} direction="up">
        <section>
          <h2 className="text-2xl font-display font-bold mb-6 text-center text-star-white">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <FadeIn
                  key={card.href}
                  delay={0.7 + idx * 0.1}
                  direction="up"
                  duration={0.5}
                >
                  <Link
                    href={card.href}
                    className={`
                      group relative p-6 rounded-xl border-2 ${card.borderColor}
                      bg-gradient-to-br ${card.gradient}
                      transition-all duration-300
                      backdrop-blur-sm
                      hover:shadow-[0_8px_32px_rgba(255,107,53,0.3)]
                      hover:scale-105
                      hover:-translate-y-1
                      block h-full
                    `}
                  >
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/10 via-transparent to-transparent" />

                    <div className="relative z-10 text-center">
                      <Icon className={`w-10 h-10 ${card.iconColor} mx-auto mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300`} />
                      <h3 className="text-xl font-display font-bold text-star-white group-hover:text-nebula-orange transition-colors">
                        {card.title}
                      </h3>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>
      </FadeIn>

      {/* Advanced Tools CTA */}
      <FadeIn delay={0.9} direction="up">
        <section className="text-center py-12">
          <Link
            href="/tools"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-royal-purple to-cosmic-purple border-2 border-cosmic-purple/60 hover:border-cosmic-purple transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:scale-105 group"
          >
            <BarChart3 className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="text-xl font-display font-bold text-white">
              Explore Advanced Tools
            </span>
            <span className="text-white group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </section>
      </FadeIn>

      {/* Status Footer */}
      <FadeIn delay={1.1} direction="up">
        <section className="text-center py-12 border-t-2 border-field-green/30 relative">
          {/* Infield dirt pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '20px 20px',
              color: 'var(--infield-dirt)'
            }}
          />

          <div className="relative z-10">
            <p className="text-sm text-star-dim font-mono">
              Powered by Google Sheets • Next.js • Real-time sync every 60s
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
