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
    gradient: "from-comets-cyan/20 via-comets-cyan/10 to-transparent",
    borderColor: "border-comets-cyan/50",
    iconColor: "text-comets-cyan",
    size: "large" as const,
  },
  {
    href: "/leaders",
    title: "Leaders",
    description: "Top performers",
    icon: TrendingUp,
    gradient: "from-comets-yellow/20 via-comets-yellow/10 to-transparent",
    borderColor: "border-comets-yellow/50",
    iconColor: "text-comets-yellow",
    size: "medium" as const,
  },
  {
    href: "/schedule",
    title: "Schedule",
    description: "Games & results",
    icon: Calendar,
    gradient: "from-comets-purple/20 via-comets-purple/10 to-transparent",
    borderColor: "border-comets-purple/50",
    iconColor: "text-comets-purple",
    size: "medium" as const,
  },
  {
    href: "/playoffs",
    title: "Playoffs",
    description: "Postseason bracket",
    icon: Award,
    gradient: "from-comets-red/20 via-comets-red/10 to-transparent",
    borderColor: "border-comets-red/50",
    iconColor: "text-comets-red",
    size: "medium" as const,
  },
];

const secondaryNavCards = [
  {
    href: "/teams",
    title: "Teams",
    description: "Team rosters & stats",
    icon: Users,
    gradient: "from-comets-blue/20 via-comets-blue/10 to-transparent",
    borderColor: "border-comets-blue/50",
    iconColor: "text-comets-blue",
  },
  {
    href: "/players",
    title: "Players",
    description: "Individual statistics",
    icon: Target,
    gradient: "from-comets-cyan/15 via-comets-purple/10 to-transparent",
    borderColor: "border-comets-cyan/40",
    iconColor: "text-comets-cyan",
  },
];

const ICON_COLOR_VALUES: Record<string, string> = {
  'text-comets-cyan': '#00F3FF',
  'text-comets-yellow': '#F4D03F',
  'text-comets-purple': '#BD00FF',
  'text-comets-red': '#FF4D4D',
  'text-comets-blue': '#2E86DE',
};

const navCardBaseClass =
  "group relative block h-full cursor-pointer overflow-hidden rounded-2xl border-2 px-8 py-8 bg-gradient-to-br " +
  "backdrop-blur-md transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 transform-gpu will-change-transform " +
  "focus-visible:ring-comets-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:transform-none";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const sectionVariants = sectionEntranceVariants(prefersReducedMotion);
  const cardHover = cardHoverVariants(prefersReducedMotion);

  return (
    <div className="space-y-16">
      {/* Hero Section - Neon Void Arcade */}
      <motion.section
        className="relative py-16"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative z-10 text-center">
          {/* Logo with neon glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-comets-cyan/15 rounded-full blur-3xl" />
              <div className="relative w-40 h-40">
                <Image
                  src={getLeagueLogo()}
                  alt="CLB Logo"
                  width={160}
                  height={160}
                  className="object-contain drop-shadow-[0_0_30px_rgba(0,243,255,0.6)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title with neon gradient */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 pb-1 leading-[1.15] sm:leading-[1.12] bg-gradient-to-r from-comets-cyan via-comets-purple to-comets-yellow bg-clip-text text-transparent">
            {LEAGUE_CONFIG.name}
          </h1>

          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl text-foreground/90 font-heading font-semibold tracking-wide">
              Season {LEAGUE_CONFIG.currentSeason}
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-comets-cyan/10 border border-comets-cyan/30">
              <div className="w-3 h-3 rounded-full bg-comets-cyan animate-pulse shadow-[0_0_12px_rgba(0,243,255,0.8)]" />
              <span className="font-ui font-semibold text-comets-cyan tracking-wide">
                SYSTEM OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Navigation - Arcade Grid */}
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
          <span className="bg-gradient-to-r from-comets-cyan to-comets-purple bg-clip-text text-transparent glow-cyan">
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
                      "shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,243,255,0.15)] transition-shadow duration-200",
                      isLarge ? "min-h-[280px]" : "min-h-[220px]"
                    )}
                    variants={cardHover}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileFocus="hover"
                  >
                    {/* Neon corner accent */}
                    <div className="pointer-events-none absolute top-4 right-4 w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity motion-reduce:transition-none">
                      <div
                        className="w-full h-full border-2 border-current rounded-lg"
                        style={{ borderColor: ICON_COLOR_VALUES[card.iconColor] || '#00F3FF' }}
                      />
                    </div>

                    {/* Hover gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 motion-reduce:opacity-0 motion-reduce:transition-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                    <div className="relative z-10 flex flex-col h-full">
                      <Icon className={`w-12 h-12 ${card.iconColor} mb-4 transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none`} />

                      <h3 className="text-3xl font-display font-bold mb-2 text-foreground group-hover:text-comets-cyan transition-colors duration-200">
                        {card.title}
                      </h3>

                      <p className="text-lg text-foreground/60 font-body group-hover:text-foreground/80 transition-colors duration-200">
                        {card.description}
                      </p>

                      {isLarge && (
                        <div className="mt-auto pt-6">
                          <div className="inline-flex items-center gap-2 text-sm font-ui font-semibold text-comets-cyan transition-all duration-200 motion-reduce:transition-none">
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
                      <h3 className="text-2xl font-display font-bold mb-2 text-foreground group-hover:text-comets-cyan transition-colors duration-200">
                        {card.title}
                      </h3>
                      <p className="text-sm text-foreground/60 font-body">
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

      {/* Status Footer */}
      <FadeIn delay={motionTokens.durations.extended} direction="up">
        <section className="text-center py-12 border-t border-comets-cyan/20 relative">
          <div className="relative z-10">
            <p className="text-sm text-foreground/40 font-mono">
              Powered by Google Sheets • Next.js • Real-time sync
            </p>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
