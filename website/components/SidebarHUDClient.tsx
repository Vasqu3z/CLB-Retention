"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAGUE_CONFIG } from "@/config/league";

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
  emblemUrl?: string;
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

// Micro HUD corner for small widgets - larger for better visibility
const MicroCorner = ({ position, color = "comets-cyan" }: { position: "tl" | "tr" | "bl" | "br"; color?: string }) => {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");

  return (
    <div
      className={cn(
        "absolute w-3 h-3 pointer-events-none",
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
        style={{ opacity: 0.8 }}
      />
      <div
        className={cn(
          "absolute h-full w-[1px]",
          isLeft ? "left-0" : "right-0",
          `bg-${color}`
        )}
        style={{ opacity: 0.8 }}
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
      {/* Scanlines - more visible */}
      <div className="absolute inset-0 scanlines opacity-[0.06] pointer-events-none" />

      {/* Mini HUD corners */}
      <MicroCorner position="tl" color={color} />
      <MicroCorner position="tr" color={color} />
      <MicroCorner position="bl" color={color} />
      <MicroCorner position="br" color={color} />

      {/* Header - stronger background */}
      <div className={cn(
        "px-3 py-2.5 border-b border-white/5 flex items-center justify-between",
        `bg-${color}/10`
      )}>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`text-${color}`}
          >
            <Icon size={14} strokeWidth={2.5} />
          </motion.div>
          <span className="font-ui text-xs uppercase tracking-[0.15em] text-white/70">
            {title}
          </span>
        </div>
        {href && (
          <motion.div
            initial={{ x: -5, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            className={`text-${color}`}
          >
            <ChevronRight size={14} />
          </motion.div>
        )}
      </div>

      {/* Content - more padding */}
      <div className="p-3">
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
    <div className="w-full h-full flex flex-col bg-surface-dark/80 border-r border-white/10 relative overflow-hidden isolate">
      {/* Background scanlines - more visible */}
      <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none" />

      {/* Animated edge glow - stronger */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-comets-cyan/40 to-transparent"
        animate={{
          opacity: [0.4, 0.8, 0.4],
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
                "0 0 12px rgba(0,243,255,0.6)",
                "0 0 0px rgba(0,243,255,0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-comets-cyan"
          />
          <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
            Live Data
          </span>
        </div>
        <h2 className="font-display text-2xl tracking-wider mt-1">
          LEAGUE <span className="text-comets-yellow" style={{ textShadow: '0 0 10px rgba(244, 208, 63, 0.5)' }}>HUD</span>
        </h2>
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain">

        {/* Standings Widget */}
        <HUDWidget
          title="Standings"
          icon={Trophy}
          color="comets-yellow"
          href="/standings"
          delay={0.1}
        >
          <div className="space-y-1">
            {standings.map((team, idx) => (
              <motion.div
                key={team.team}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.03 }}
                className={cn(
                  "flex items-center justify-between py-1 px-1.5 rounded-sm transition-colors",
                  "hover:bg-white/5",
                  idx % 2 === 0 ? "bg-white/[0.02]" : ""
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-white/40 w-4">
                    {team.rank}
                  </span>
                  {team.emblemUrl ? (
                    <Image
                      src={team.emblemUrl}
                      alt={team.team}
                      width={18}
                      height={18}
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
                    className="font-ui text-sm font-medium text-white/90 hover:text-comets-yellow transition-colors"
                    title={team.team}
                  >
                    {team.abbr}
                  </Link>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="font-mono text-xs text-white/60">
                    {team.wins}-{team.losses}
                  </span>
                  <span
                    className="font-mono text-sm text-comets-yellow tabular-nums font-medium"
                    style={{ textShadow: '0 0 8px rgba(244, 208, 63, 0.4)' }}
                  >
                    {team.winPct}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </HUDWidget>

        {/* League Leaders Widget - 1 per category for cleaner look */}
        <HUDWidget
          title="Top Performers"
          icon={TrendingUp}
          color="comets-cyan"
          href="/leaders"
          delay={0.2}
        >
          <div className="space-y-2.5">
            {/* Batting Average */}
            {leaders.batting.slice(0, 1).map((player) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-comets-cyan uppercase tracking-wide w-8">AVG</span>
                  {player.emblemUrl && (
                    <Image src={player.emblemUrl} alt="" width={16} height={16} className="flex-shrink-0" />
                  )}
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-sm text-white/90 hover:text-comets-cyan transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                </div>
                <span
                  className="font-mono text-sm text-comets-cyan tabular-nums flex-shrink-0 font-medium"
                  style={{ textShadow: '0 0 8px rgba(0, 243, 255, 0.4)' }}
                >
                  {player.value}
                </span>
              </motion.div>
            ))}

            {/* Home Runs */}
            {leaders.homeRuns.slice(0, 1).map((player) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-comets-red uppercase tracking-wide w-8">HR</span>
                  {player.emblemUrl && (
                    <Image src={player.emblemUrl} alt="" width={16} height={16} className="flex-shrink-0" />
                  )}
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-sm text-white/90 hover:text-comets-red transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                </div>
                <span
                  className="font-mono text-sm text-comets-red tabular-nums flex-shrink-0 font-medium"
                  style={{ textShadow: '0 0 8px rgba(255, 77, 77, 0.4)' }}
                >
                  {player.value}
                </span>
              </motion.div>
            ))}

            {/* ERA */}
            {leaders.era.slice(0, 1).map((player) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-comets-purple uppercase tracking-wide w-8">ERA</span>
                  {player.emblemUrl && (
                    <Image src={player.emblemUrl} alt="" width={16} height={16} className="flex-shrink-0" />
                  )}
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-sm text-white/90 hover:text-comets-purple transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                </div>
                <span
                  className="font-mono text-sm text-comets-purple tabular-nums flex-shrink-0 font-medium"
                  style={{ textShadow: '0 0 8px rgba(189, 0, 255, 0.4)' }}
                >
                  {player.value}
                </span>
              </motion.div>
            ))}

            {/* Nice Plays */}
            {leaders.nicePlays.slice(0, 1).map((player) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-comets-yellow uppercase tracking-wide w-8">NP</span>
                  {player.emblemUrl && (
                    <Image src={player.emblemUrl} alt="" width={16} height={16} className="flex-shrink-0" />
                  )}
                  <Link
                    href={`/players/${player.slug}`}
                    className="font-ui text-sm text-white/90 hover:text-comets-yellow transition-colors truncate"
                  >
                    {player.name}
                  </Link>
                </div>
                <span
                  className="font-mono text-sm text-comets-yellow tabular-nums flex-shrink-0 font-medium"
                  style={{ textShadow: '0 0 8px rgba(244, 208, 63, 0.4)' }}
                >
                  {player.value}
                </span>
              </motion.div>
            ))}
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
          <div className="space-y-2.5">
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
                    className="block p-2 rounded-sm bg-white/[0.02] border border-white/5 hover:border-comets-green/30 hover:bg-white/[0.04] transition-all"
                  >
                    <GameScoreContent game={game} />
                  </Link>
                ) : (
                  <div className="p-2 rounded-sm bg-white/[0.02] border border-white/5">
                    <GameScoreContent game={game} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </HUDWidget>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 border-t border-white/10"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                "0 0 0px rgba(76, 217, 100, 0)",
                "0 0 8px rgba(76, 217, 100, 0.5)",
                "0 0 0px rgba(76, 217, 100, 0)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-comets-green"
          />
          <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
            Season {LEAGUE_CONFIG.currentSeason}
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {game.homeEmblem ? (
            <Image
              src={game.homeEmblem}
              alt={game.homeTeam}
              width={18}
              height={18}
              className="flex-shrink-0 object-contain"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: game.homeColor }}
            />
          )}
          <span className={cn(
            "font-ui text-sm",
            homeWon ? "text-white font-medium" : "text-white/50"
          )}>
            {game.homeShort}
          </span>
        </div>
        <span
          className={cn(
            "font-mono tabular-nums text-sm",
            homeWon ? "text-comets-green font-medium" : "text-white/50"
          )}
          style={homeWon ? { textShadow: '0 0 8px rgba(76, 217, 100, 0.4)' } : undefined}
        >
          {game.homeScore}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {game.awayEmblem ? (
            <Image
              src={game.awayEmblem}
              alt={game.awayTeam}
              width={18}
              height={18}
              className="flex-shrink-0 object-contain"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: game.awayColor }}
            />
          )}
          <span className={cn(
            "font-ui text-sm",
            !homeWon ? "text-white font-medium" : "text-white/50"
          )}>
            {game.awayShort}
          </span>
        </div>
        <span
          className={cn(
            "font-mono tabular-nums text-sm",
            !homeWon ? "text-comets-green font-medium" : "text-white/50"
          )}
          style={!homeWon ? { textShadow: '0 0 8px rgba(76, 217, 100, 0.4)' } : undefined}
        >
          {game.awayScore}
        </span>
      </div>
      <div className="text-xs font-mono text-white/50 pt-1 text-center border-t border-white/5">
        {game.label}
      </div>
    </div>
  );
}
