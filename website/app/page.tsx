"use client";

import Link from "next/link";
import Image from "next/image";
import { LEAGUE_CONFIG } from "@/config/league";
import { getLeagueLogo } from "@/lib/teamLogos";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Calendar, Users, Target, Award } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import { cardHoverVariants, sectionEntranceVariants } from "@/components/animations/motionVariants";
import { motionTokens } from "@/components/animations/motionTokens";
import useReducedMotion from "@/hooks/useReducedMotion";

const mainNavCards = [
  {
    href: "/standings",
    title: "Standings",
    description: "Current season rankings",
    icon: Trophy,
    gradient: "from-field-green/30 via-nebula-teal/20 to-transparent",
    borderColor: "border-field-green/60",
    iconColor: "text-field-green",
    size: "large" as const,
  },
  {
    href: "/leaders",
    title: "Leaders",
    description: "Top performers",
    icon: TrendingUp,
    gradient: "from-solar-gold/25 via-comet-yellow/15 to-transparent",
    borderColor: "border-solar-gold/60",
    iconColor: "text-solar-gold",
    size: "medium" as const,
  },
  {
    href: "/schedule",
    title: "Schedule",
    description: "Games & results",
    icon: Calendar,
    gradient: "from-cosmic-purple/25 via-deep-violet/15 to-transparent",
    borderColor: "border-cosmic-purple/60",
    iconColor: "text-cosmic-purple",
    size: "medium" as const,
  },
  {
    href: "/playoffs",
    title: "Playoffs",
    description: "Postseason bracket",
    icon: Award,
    gradient: "from-infield-dirt/30 to-leather-brown/10",
    borderColor: "border-infield-dirt/60",
    iconColor: "text-infield-dirt",
    size: "medium" as const,
  },
];

const secondaryNavCards = [
  {
    href: "/teams",
    title: "Teams",
    description: "Team rosters & stats",
    icon: Users,
    gradient: "from-nebula-orange/20 to-nebula-coral/10",
    borderColor: "border-nebula-orange/50",
    iconColor: "text-nebula-orange",
  },
  {
    href: "/players",
    title: "Players",
    description: "Individual statistics",
    icon: Target,
    gradient: "from-nebula-cyan/20 to-nebula-teal/10",
    borderColor: "border-nebula-cyan/50",
    iconColor: "text-nebula-cyan",
  },
];

const ICON_COLOR_VALUES: Record<string, string> = {
  'text-field-green': '#2D5F3F',
  'text-solar-gold': '#FFA62B',
  'text-cosmic-purple': '#8B5CF6',
  'text-infield-dirt': '#A0826D',
  'text-nebula-orange': '#FF6B35',
  'text-nebula-cyan': '#00D4FF',
};

const navCardBaseClass =
  "group relative block h-full cursor-pointer overflow-hidden rounded-2xl border-2 px-8 py-8 bg-gradient-to-br " +
  "backdrop-blur-md transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 transform-gpu will-change-transform " +
  "focus-visible:ring-nebula-teal focus-visible:ring-offset-2 focus-visible:ring-offset-space-black motion-reduce:transition-none motion-reduce:transform-none";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const sectionVariants = sectionEntranceVariants(prefersReducedMotion);
  const cardHover = cardHoverVariants(prefersReducedMotion);

  return (
    <div className="space-y-16">
      {/* Hero Section - Baseball Diamond Inspired */}
      <motion.section
        className="relative py-16"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Baseball stitching pattern background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 12px
            )`,
            color: '#2D5F3F'
          }}
        />
        <div className="relative z-10 text-center">
          {/* Logo with baseball-inspired glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-field-green/20 rounded-full blur-3xl" />
              <div className="relative w-40 h-40">
                <Image
                  src={getLeagueLogo()}
                  alt="CLB Logo"
                  width={160}
                  height={160}
                  className="object-contain drop-shadow-[0_0_30px_rgba(45,95,63,0.8)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title with distinctive gradient */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight bg-gradient-to-r from-nebula-orange via-nebula-coral to-cosmic-purple bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            {LEAGUE_CONFIG.name}
          </h1>

          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl text-vintage-cream font-display font-semibold tracking-wide text-shadow-strong">
              Season {LEAGUE_CONFIG.currentSeason}
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-field-green/10 border border-field-green/30">
              <div className="w-3 h-3 rounded-full bg-nebula-teal animate-pulse shadow-[0_0_12px_rgba(0,212,255,0.8)]" />
              <span className="font-display font-semibold text-nebula-teal tracking-wide">
                SYSTEM OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Navigation - Asymmetric Baseball Diamond Layout */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
      >
        <motion.h2
          variants={sectionVariants}
          className="text-3xl font-display font-bold mb-8 text-center"
        >
          <span className="bg-gradient-to-r from-field-green to-nebula-teal bg-clip-text text-transparent">
            Game Center
          </span>
        </motion.h2>

        {/* Asymmetric grid - NOT the boring 3x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {mainNavCards.map((card, idx) => {
            const Icon = card.icon;
            const isLarge = card.size === 'large';

            return (
              <FadeIn
                key={card.href}
                delay={motionTokens.durations.fast + idx * 0.06}
                direction="up"
                duration={motionTokens.durations.extended}
                className={isLarge ? "lg:col-span-2" : ""}
              >
                <Link href={card.href} className="block h-full">
                  <motion.div
                    className={cn(
                      navCardBaseClass,
                      card.borderColor,
                      card.gradient,
                      "shadow-[0_12px_40px_rgba(45,95,63,0.15)] transition-shadow duration-200",
                      isLarge ? "min-h-[280px]" : "min-h-[220px]"
                    )}
                    variants={cardHover}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileFocus="hover"
                  >
                    {/* Baseball stitch decoration */}
                    <div className="pointer-events-none absolute top-4 right-4 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity motion-reduce:transition-none">
                      <div
                        className="w-full h-full border-4 border-current rounded-full border-dashed"
                        style={{ borderColor: ICON_COLOR_VALUES[card.iconColor] || '#E8EDF5' }}
                      />
                    </div>

                    {/* Hover gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:opacity-0 motion-reduce:transition-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                    <div className="relative z-10 flex flex-col h-full">
                      <Icon className={`w-12 h-12 ${card.iconColor} mb-4 transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none`} />

                      <h3 className="text-3xl font-display font-bold mb-2 text-star-white group-hover:text-vintage-cream transition-colors duration-200">
                        {card.title}
                      </h3>

                      <p className="text-lg text-star-gray font-body group-hover:text-star-white transition-colors duration-200">
                        {card.description}
                      </p>

                      {isLarge && (
                        <div className="mt-auto pt-6">
                          <div className="inline-flex items-center gap-2 text-sm font-display font-semibold text-field-green transition-all duration-200 motion-reduce:transition-none">
                            View Details
                            <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:translate-x-0 motion-reduce:transition-none">→</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        {/* Secondary nav - 2 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {secondaryNavCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <FadeIn
                key={card.href}
                delay={motionTokens.durations.extended + idx * 0.05}
                direction="up"
                duration={motionTokens.durations.base}
              >
                <Link href={card.href} className="block h-full">
                  <motion.div
                    className={cn(
                      navCardBaseClass,
                      card.borderColor,
                      card.gradient,
                      "backdrop-blur-sm shadow-[0_8px_24px_rgba(255,255,255,0.08)] min-h-[180px]"
                    )}
                    variants={cardHover}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileFocus="hover"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:transition-none bg-gradient-to-br from-transparent via-white/5 to-transparent" />

                    <div className="relative z-10 text-center">
                      <Icon className={`w-12 h-12 ${card.iconColor} mx-auto mb-4 transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none`} />
                      <h3 className="text-2xl font-display font-bold mb-2 text-star-white">
                        {card.title}
                      </h3>
                      <p className="text-sm text-star-gray font-body">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </motion.section>

      {/* Status Footer with Baseball Theme */}
      <FadeIn delay={motionTokens.durations.extended} direction="up">
        <section className="text-center py-12 border-t-2 border-field-green/30 relative">
          {/* Infield dirt pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '20px 20px',
              color: '#A0826D'
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
