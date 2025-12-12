"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Zap, Activity, ChevronRight, Users, Scale, Sliders, Link2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for the data passed from server component
interface Standing {
  rank: string;
  team: string;
  abbr: string;
  wins: number;
  losses: number;
  winPct: string;
  color?: string;
  emblemUrl?: string;
  slug?: string;
}

interface Leader {
  name: string;
  value: string | number;
  team?: string;
  slug?: string;
}

interface RecentGame {
  homeTeam: string;
  homeShort: string;
  homeColor: string;
  homeEmblem?: string;
  homeScore: number;
  awayTeam: string;
  awayShort: string;
  awayColor: string;
  awayEmblem?: string;
  awayScore: number;
  boxScoreUrl?: string;
  label: string;
}

interface SidebarHUDClientProps {
  standings: Standing[];
  leaders: {
    batting: Leader[];
    homeRuns: Leader[];
    era: Leader[];
    nicePlays: Leader[];
  };
  recentGames: RecentGame[];
}

// Micro HUD corner for small widgets
const MicroCorner = ({ position, color = "comets-cyan" }: { position: "tl" | "tr" | "bl" | "br"; color?: string }) => {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <div
      className={cn(
        "absolute w-2 h-2 pointer-events-none",
        isTop ? "top-0" : "bottom-0",
        isLeft ? "left-0" : "right-0"
      )}
    >
      <div
        className={cn(
          "absolute w-full h-[1px]",
          isTop ? "top-0" : "bottom-0",
          `bg-${color}`
        )}
        style={{ opacity: 0.6 }}
      />
      <div
        className={cn(
          "absolute h-full w-[1px]",
          isLeft ? "left-0" : "right-0",
          `bg-${color}`
        )}
        style={{ opacity: 0.6 }}
      />
    </div>
  );
};

// HUD Widget wrapper with mini corners and title
const HUDWidget = ({
  title,
  icon: Icon,
  color = "comets-cyan",
  children,
  href,
  delay = 0
}: {
  title: string;
  icon: React.ElementType;
  color?: string;
  children: React.ReactNode;
  href?: string;
  delay?: number;
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
      className="relative bg-black/40 border border-white/10 rounded-sm overflow-hidden group"
    >
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none" />

      {/* Mini HUD corners */}
      <MicroCorner position="tl" color={color} />
      <MicroCorner position="tr" color={color} />
      <MicroCorner position="bl" color={color} />
      <MicroCorner position="br" color={color} />

      {/* Header */}
      <div className={cn(
        "px-3 py-2 border-b border-white/5 flex items-center justify-between",
        `bg-${color}/5`
      )}>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`text-${color}`}
          >
            <Icon size={12} strokeWidth={2.5} />
          </motion.div>
          <span className="font-ui text-xs uppercase tracking-[0.15em] text-white/60">
            {title}
          </span>
        </div>
        {href && (
          <motion.div
            initial={{ x: -5, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            className={`text-${color}`}
          >
            <ChevronRight size={12} />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {children}
      </div>

      {/* Hover glow effect */}
      {href && (
        <motion.div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
            `bg-gradient-to-r from-${color}/5 to-transparent`
          )}
        />
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

// Animated stat value with glow
const StatValue = ({
  value,
  color = "comets-yellow",
  mono = true
}: {
  value: string | number;
  color?: string;
  mono?: boolean;
}) => (
  <motion.span
    className={cn(
      "tabular-nums",
      mono ? "font-mono text-[13px]" : "font-ui text-[13px]",
      `text-${color}`
    )}
    style={{
      textShadow: `0 0 8px var(--${color})`,
    }}
  >
    {value}
  </motion.span>
);

export default function SidebarHUDClient({ standings, leaders, recentGames }: SidebarHUDClientProps) {
  return (
    <div className="w-full h-full flex flex-col bg-surface-dark/80 border-r border-white/10 relative overflow-hidden">
      {/* Background scanlines */}
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none" />

      {/* Animated edge glow */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-comets-cyan/30 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 border-b border-white/10"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0px rgba(0,243,255,0)",
                "0 0 10px rgba(0,243,255,0.5)",
                "0 0 0px rgba(0,243,255,0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-comets-cyan"
          />
          <span className="font-mono text-[11px] text-white/40 uppercase tracking-widest">
            Live Data
          </span>
        </div>
        <h2 className="font-display text-xl tracking-wider mt-1">
          LEAGUE <span className="text-comets-yellow">HUD</span>
        </h2>
      </motion.div>

      {/* Scrollable content - overscroll-contain prevents scroll from propagating to page */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain">

        {/* Standings Widget */}
        <HUDWidget
          title="Standings"
          icon={Trophy}
          color="comets-yellow"
          href="/standings"
          delay={0.1}
        >
          <div className="space-y-0.5">
            {standings.map((team, idx) => (
              <motion.div
                key={team.team}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.03 }}
                className={cn(
                  "flex items-center justify-between py-0.5 px-1 rounded-sm transition-colors",
                  "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-white/30 w-4">
                    {team.rank}
                  </span>
                  {team.emblemUrl ? (
                    <Image
                      src={team.emblemUrl}
                      alt={team.team}
                      width={16}
                      height={16}
                      className="flex-shrink-0 object-contain"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color || "#fff" }}
                    />
                  )}
                  <Link
                    href={`/teams/${team.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-ui text-[13px] font-medium text-white/90 hover:text-comets-yellow transition-colors"
                    title={team.team}
                  >
                    {team.abbr}
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-white/50">
                    {team.wins}-{team.losses}
                  </span>
                  <span className="font-mono text-xs text-comets-yellow tabular-nums font-medium">
                    {team.winPct}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </HUDWidget>

        {/* League Leaders Widget */}
        <HUDWidget
          title="Top Performers"
          icon={TrendingUp}
          color="comets-cyan"
          href="/leaders"
          delay={0.2}
        >
          <div className="space-y-2">
            {/* Batting Average */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-comets-cyan/70 uppercase tracking-wide">AVG</span>
              </div>
              {leaders.batting.slice(0, 2).map((player, idx) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-[13px] text-white/80 hover:text-comets-cyan transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                  <span className="font-mono text-[13px] text-comets-cyan tabular-nums flex-shrink-0">
                    {player.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Home Runs */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-comets-red/70 uppercase tracking-wide">HR</span>
              </div>
              {leaders.homeRuns.slice(0, 2).map((player, idx) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-[13px] text-white/80 hover:text-comets-red transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                  <span className="font-mono text-[13px] text-comets-red tabular-nums flex-shrink-0">
                    {player.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ERA */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-comets-purple/70 uppercase tracking-wide">ERA</span>
              </div>
              {leaders.era.slice(0, 2).map((player, idx) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-[13px] text-white/80 hover:text-comets-purple transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                  <span className="font-mono text-[13px] text-comets-purple tabular-nums flex-shrink-0">
                    {player.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Nice Plays */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-comets-yellow/70 uppercase tracking-wide">Nice Plays</span>
              </div>
              {leaders.nicePlays.slice(0, 2).map((player, idx) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + idx * 0.05 }}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-[13px] text-white/80 hover:text-comets-yellow transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                  <span className="font-mono text-[13px] text-comets-yellow tabular-nums flex-shrink-0">
                    {player.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </HUDWidget>

        {/* Recent Games Widget */}
        <HUDWidget
          title="Recent Games"
          icon={Activity}
          color="comets-green"
          href="/schedule"
          delay={0.3}
        >
          <div className="space-y-2">
            {recentGames.slice(0, 4).map((game, idx) => (
              <motion.div
                key={`${game.homeTeam}-${game.awayTeam}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                {game.boxScoreUrl ? (
                  <Link
                    href={game.boxScoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-1.5 rounded-sm bg-white/[0.02] border border-white/5 hover:border-comets-green/30 hover:bg-white/[0.04] transition-all"
                  >
                    <GameScoreContent game={game} />
                  </Link>
                ) : (
                  <div className="p-1.5 rounded-sm bg-white/[0.02] border border-white/5">
                    <GameScoreContent game={game} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </HUDWidget>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <div className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-2 px-1">
            Tools
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { name: "Lineup", href: "/tools/lineup", Icon: Users, color: "comets-cyan" },
              { name: "Compare", href: "/tools/compare", Icon: Scale, color: "comets-yellow" },
              { name: "Attributes", href: "/tools/attributes", Icon: Sliders, color: "comets-purple" },
              { name: "Chemistry", href: "/tools/chemistry", Icon: Link2, color: "comets-green" },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="flex items-center gap-1.5 p-2 rounded-sm bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all group"
              >
                <tool.Icon
                  size={14}
                  className={`text-${tool.color}/60 group-hover:text-${tool.color} transition-colors`}
                />
                <span className="font-ui text-xs uppercase tracking-wider text-white/60 group-hover:text-white/90 transition-colors">
                  {tool.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-3 border-t border-white/5"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-comets-green"
          />
          <span className="font-mono text-[11px] text-white/30 uppercase tracking-widest">
            Season 1
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// Extracted game score component for cleaner code
function GameScoreContent({ game }: { game: RecentGame }) {
  const homeWon = game.homeScore > game.awayScore;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {game.homeEmblem ? (
            <Image
              src={game.homeEmblem}
              alt={game.homeTeam}
              width={16}
              height={16}
              className="flex-shrink-0 object-contain"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: game.homeColor }}
            />
          )}
          <span className={cn(
            "font-ui",
            homeWon ? "text-white font-medium" : "text-white/50"
          )}>
            {game.homeShort}
          </span>
        </div>
        <span className={cn(
          "font-mono tabular-nums text-[13px]",
          homeWon ? "text-comets-green font-medium" : "text-white/50"
        )}>
          {game.homeScore}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {game.awayEmblem ? (
            <Image
              src={game.awayEmblem}
              alt={game.awayTeam}
              width={16}
              height={16}
              className="flex-shrink-0 object-contain"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: game.awayColor }}
            />
          )}
          <span className={cn(
            "font-ui",
            !homeWon ? "text-white font-medium" : "text-white/50"
          )}>
            {game.awayShort}
          </span>
        </div>
        <span className={cn(
          "font-mono tabular-nums text-[13px]",
          !homeWon ? "text-comets-green font-medium" : "text-white/50"
        )}>
          {game.awayScore}
        </span>
      </div>
      <div className="text-[10px] font-mono text-white/40 pt-0.5 text-center border-t border-white/5">
        {game.label}
      </div>
    </div>
  );
}
