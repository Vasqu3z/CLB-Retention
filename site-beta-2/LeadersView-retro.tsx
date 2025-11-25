'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderEntry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import { playerNameToSlug } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Trophy, TrendingUp, Zap } from 'lucide-react';

interface LeadersViewProps {
  initialBattingLeaders: any;
  initialPitchingLeaders: any;
  initialFieldingLeaders: any;
  playoffBattingLeaders: any;
  playoffPitchingLeaders: any;
  playoffFieldingLeaders: any;
}

type Tab = 'batting' | 'pitching' | 'fielding';

export default function LeadersView({
  initialBattingLeaders,
  initialPitchingLeaders,
  initialFieldingLeaders,
  playoffBattingLeaders,
  playoffPitchingLeaders,
  playoffFieldingLeaders,
}: LeadersViewProps) {
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('batting');

  const battingLeaders = isPlayoffs ? playoffBattingLeaders : initialBattingLeaders;
  const pitchingLeaders = isPlayoffs ? playoffPitchingLeaders : initialPitchingLeaders;
  const fieldingLeaders = isPlayoffs ? playoffFieldingLeaders : initialFieldingLeaders;

  return (
    <div className="space-y-8 relative">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Season Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setIsPlayoffs(false)}
              className={`
                relative px-6 py-2.5 rounded-md font-ui font-bold text-sm tracking-wider transition-all duration-300
                ${!isPlayoffs 
                  ? 'bg-arcade-cyan text-black shadow-[0_0_20px_rgba(0,243,255,0.6)]' 
                  : 'text-white/60 hover:text-white/90'
                }
              `}
            >
              {!isPlayoffs && (
                <motion.div
                  layoutId="season-indicator"
                  className="absolute inset-0 bg-arcade-cyan rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">REGULAR SEASON</span>
            </button>
            <button
              onClick={() => setIsPlayoffs(true)}
              className={`
                relative px-6 py-2.5 rounded-md font-ui font-bold text-sm tracking-wider transition-all duration-300
                ${isPlayoffs 
                  ? 'bg-arcade-yellow text-black shadow-[0_0_20px_rgba(244,208,63,0.6)]' 
                  : 'text-white/60 hover:text-white/90'
                }
              `}
            >
              {isPlayoffs && (
                <motion.div
                  layoutId="season-indicator"
                  className="absolute inset-0 bg-arcade-yellow rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">PLAYOFFS</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-gradient-to-r from-black/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-xl">
          <TabButton
            active={activeTab === 'batting'}
            onClick={() => setActiveTab('batting')}
            label="BATTING"
            icon={<TrendingUp className="w-4 h-4" />}
            color="from-arcade-red to-arcade-red/80"
          />
          <TabButton
            active={activeTab === 'pitching'}
            onClick={() => setActiveTab('pitching')}
            label="PITCHING"
            icon={<Zap className="w-4 h-4" />}
            color="from-arcade-yellow to-arcade-yellow/80"
          />
          <TabButton
            active={activeTab === 'fielding'}
            onClick={() => setActiveTab('fielding')}
            label="FIELDING"
            icon={<Trophy className="w-4 h-4" />}
            color="from-arcade-purple to-arcade-blue"
          />
        </div>
      </motion.div>

      {/* Leaders Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${isPlayoffs}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Batting Leaders */}
          {activeTab === 'batting' && (
            <>
              <LeaderCard title="Batting Average" abbr="AVG" leaders={battingLeaders.avg} color="cyan" />
              <LeaderCard title="Hits" abbr="H" leaders={battingLeaders.hits} color="yellow" />
              <LeaderCard title="Home Runs" abbr="HR" leaders={battingLeaders.hr} color="red" />
              <LeaderCard title="Runs Batted In" abbr="RBI" leaders={battingLeaders.rbi} color="purple" />
              <LeaderCard title="Slugging %" abbr="SLG" leaders={battingLeaders.slg} color="blue" />
              <LeaderCard title="On-Base + Slugging" abbr="OPS" leaders={battingLeaders.ops} color="cyan" />
            </>
          )}

          {/* Pitching Leaders */}
          {activeTab === 'pitching' && (
            <>
              <LeaderCard title="Innings Pitched" abbr="IP" leaders={pitchingLeaders.ip} color="yellow" />
              <LeaderCard title="Wins" abbr="W" leaders={pitchingLeaders.wins} color="cyan" />
              <LeaderCard title="Losses" abbr="L" leaders={pitchingLeaders.losses} color="red" />
              <LeaderCard title="Saves" abbr="SV" leaders={pitchingLeaders.saves} color="purple" />
              <LeaderCard title="Earned Run Average" abbr="ERA" leaders={pitchingLeaders.era} color="blue" />
              <LeaderCard title="WHIP" abbr="WHIP" leaders={pitchingLeaders.whip} color="cyan" />
              <LeaderCard title="Batting Average Against" abbr="BAA" leaders={pitchingLeaders.baa} color="yellow" />
            </>
          )}

          {/* Fielding Leaders */}
          {activeTab === 'fielding' && (
            <>
              <LeaderCard title="Nice Plays" abbr="NP" leaders={fieldingLeaders.nicePlays} color="cyan" />
              <LeaderCard title="Errors" abbr="E" leaders={fieldingLeaders.errors} color="red" />
              <LeaderCard title="Stolen Bases" abbr="SB" leaders={fieldingLeaders.stolenBases} color="purple" />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function TabButton({ active, onClick, label, icon, color }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg
        font-ui font-bold text-sm tracking-wider transition-all duration-300
        ${active 
          ? `bg-gradient-to-r ${color} text-black shadow-[0_0_30px_rgba(0,243,255,0.4)]` 
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="active-tab-glow"
          className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 blur-xl rounded-lg`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
}

interface LeaderCardProps {
  title: string;
  abbr: string;
  leaders: LeaderEntry[];
  color: 'cyan' | 'yellow' | 'red' | 'purple' | 'blue';
}

const colorMap = {
  cyan: {
    border: 'border-arcade-cyan/30',
    glow: 'shadow-[0_0_20px_rgba(0,243,255,0.2)]',
    text: 'text-arcade-cyan',
    bg: 'bg-arcade-cyan/10',
    gradient: 'from-arcade-cyan/20 to-transparent',
  },
  yellow: {
    border: 'border-arcade-yellow/30',
    glow: 'shadow-[0_0_20px_rgba(244,208,63,0.2)]',
    text: 'text-arcade-yellow',
    bg: 'bg-arcade-yellow/10',
    gradient: 'from-arcade-yellow/20 to-transparent',
  },
  red: {
    border: 'border-arcade-red/30',
    glow: 'shadow-[0_0_20px_rgba(255,77,77,0.2)]',
    text: 'text-arcade-red',
    bg: 'bg-arcade-red/10',
    gradient: 'from-arcade-red/20 to-transparent',
  },
  purple: {
    border: 'border-arcade-purple/30',
    glow: 'shadow-[0_0_20px_rgba(189,0,255,0.2)]',
    text: 'text-arcade-purple',
    bg: 'bg-arcade-purple/10',
    gradient: 'from-arcade-purple/20 to-transparent',
  },
  blue: {
    border: 'border-arcade-blue/30',
    glow: 'shadow-[0_0_20px_rgba(46,134,222,0.2)]',
    text: 'text-arcade-blue',
    bg: 'bg-arcade-blue/10',
    gradient: 'from-arcade-blue/20 to-transparent',
  },
};

function LeaderCard({ title, abbr, leaders, color }: LeaderCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        relative group
        bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl
        border-2 ${colors.border} ${colors.glow}
        rounded-xl p-6 overflow-hidden
        hover:${colors.glow.replace('0.2', '0.4')}
        transition-all duration-300
      `}
    >
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />

      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} rounded-bl-full opacity-40`} />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5 pb-4 border-b border-white/10">
        <h3 className={`text-lg font-display font-bold ${colors.text} tracking-tight`}>
          {title}
        </h3>
        <span className={`font-mono font-bold text-xs ${colors.text} ${colors.bg} px-3 py-1 rounded-full border ${colors.border}`}>
          {abbr}
        </span>
      </div>

      {/* Leaders List */}
      <div className="relative space-y-2">
        {leaders.length === 0 && (
          <p className="text-white/40 text-sm italic font-mono text-center py-4">
            NO DATA YET
          </p>
        )}
        {leaders.slice(0, 5).map((leader, idx) => {
          const teamConfig = leader.team ? getTeamByName(leader.team) : null;
          const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                group/item relative py-2.5 px-3 rounded-lg 
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:${colors.border}
                transition-all duration-300
              `}
            >
              <div className="flex justify-between items-center gap-3">
                {/* Left: Rank + Player */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`
                    flex-shrink-0 w-7 h-7 flex items-center justify-center
                    ${colors.bg} border ${colors.border} rounded-md
                    font-mono font-bold text-xs ${colors.text}
                  `}>
                    {leader.rank}
                  </div>

                  {leader.isTieSummary ? (
                    <span className="font-medium italic text-white/50 font-mono text-sm truncate">
                      {leader.player}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Team Logo */}
                      {logos && teamConfig && (
                        <Link
                          href={`/teams/${teamConfig.slug}`}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                          title={leader.team}
                        >
                          <div className="w-5 h-5 relative">
                            <Image
                              src={logos.emblem}
                              alt={leader.team}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        </Link>
                      )}
                      {/* Player Name */}
                      <Link
                        href={`/players/${playerNameToSlug(leader.player)}`}
                        className={`
                          font-semibold text-sm text-white hover:${colors.text}
                          transition-colors truncate
                        `}
                      >
                        {leader.player}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right: Value */}
                <span className={`
                  flex-shrink-0 ${colors.text} font-mono font-bold text-base
                  ${colors.bg} px-3 py-1 rounded-md border ${colors.border}
                `}>
                  {leader.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
