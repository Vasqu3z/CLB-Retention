'use client';

import { motion } from 'framer-motion';
import { BracketRound, StandingsRow } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import Link from "next/link";
import Image from "next/image";
import { Trophy, ExternalLink } from 'lucide-react';

interface BracketViewProps {
  bracket: BracketRound[];
  standings: StandingsRow[];
}

export default function BracketView({ bracket, standings }: BracketViewProps) {
  // Helper function to get team seed from standings
  const getTeamSeed = (teamName: string): string => {
    const team = standings.find(s => s.team === teamName);
    return team ? `#${team.rank}` : '';
  };

  // Helper function to get short team name
  const getShortName = (teamName: string): string => {
    const parts = teamName.split(' ');
    return parts[parts.length - 1];
  };

  if (bracket.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-12 text-center overflow-hidden"
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
        
        <div className="relative z-10 space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-arcade-yellow opacity-40" />
          <p className="text-2xl font-display font-bold text-white">NO PLAYOFF GAMES SCHEDULED</p>
          <p className="text-lg font-ui text-white/60">Check back when the postseason begins!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {bracket.map((round, roundIdx) => (
        <motion.div
          key={roundIdx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: roundIdx * 0.1 }}
          className="relative"
        >
          {/* Round Container */}
          <div className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-8 overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />

            {/* Round Header */}
            <div className="relative mb-8 pb-6 border-b border-white/20">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                <span className="bg-gradient-to-r from-arcade-yellow via-arcade-red to-arcade-purple bg-clip-text text-transparent">
                  {round.name}
                </span>
              </h2>
            </div>

            {/* Series Grid */}
            <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {round.series.map((series, seriesIdx) => {
                const teamAConfig = getTeamByName(series.teamA);
                const teamBConfig = getTeamByName(series.teamB);
                const teamALogos = teamAConfig ? getTeamLogoPaths(teamAConfig.name) : null;
                const teamBLogos = teamBConfig ? getTeamLogoPaths(teamBConfig.name) : null;

                return (
                  <motion.div
                    key={seriesIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ 
                      delay: seriesIdx * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    className="
                      relative group
                      bg-gradient-to-br from-black/40 to-black/60
                      border-2 border-white/20
                      hover:border-arcade-cyan/50
                      shadow-[0_0_20px_rgba(0,0,0,0.5)]
                      hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]
                      rounded-xl overflow-hidden
                      transition-all duration-300
                    "
                  >
                    {/* Series Header */}
                    <div className="relative bg-gradient-to-r from-arcade-cyan/20 to-arcade-purple/20 px-4 py-3 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-ui font-bold text-white uppercase tracking-wider">
                          {getTeamSeed(series.teamA)} {getShortName(series.teamA)} vs. {getTeamSeed(series.teamB)} {getShortName(series.teamB)}
                        </span>
                        {series.winner && (
                          <div className="flex items-center gap-1.5 bg-arcade-yellow/20 text-arcade-yellow px-2.5 py-1 rounded-full border border-arcade-yellow/30">
                            <Trophy className="w-3 h-3" />
                            <span className="text-xs font-ui font-bold">COMPLETE</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Matchup */}
                    <div className="p-5 space-y-3">
                      {/* Team A */}
                      <div
                        className={`
                          relative flex items-center justify-between p-4 rounded-lg 
                          transition-all duration-300
                          ${series.winner === series.teamA
                            ? 'bg-arcade-yellow/20 border-2 border-arcade-yellow/60 shadow-[0_0_20px_rgba(244,208,63,0.3)]'
                            : 'bg-white/5 border border-white/20 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {teamALogos && (
                            <div className="w-6 h-6 relative flex-shrink-0">
                              <Image
                                src={teamALogos.emblem}
                                alt={series.teamA}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span
                            className={`font-ui font-semibold text-sm truncate ${
                              series.winner === series.teamA ? 'font-bold' : ''
                            }`}
                            style={
                              series.winner === series.teamA && teamAConfig
                                ? { color: teamAConfig.primaryColor }
                                : { color: '#FFFFFF' }
                            }
                          >
                            {series.teamA}
                          </span>
                        </div>
                        <span className={`
                          font-mono font-bold text-2xl flex-shrink-0
                          ${series.winner === series.teamA ? 'text-arcade-yellow' : 'text-white/40'}
                        `}>
                          {series.winsA}
                        </span>
                      </div>

                      {/* Team B */}
                      <div
                        className={`
                          relative flex items-center justify-between p-4 rounded-lg 
                          transition-all duration-300
                          ${series.winner === series.teamB
                            ? 'bg-arcade-yellow/20 border-2 border-arcade-yellow/60 shadow-[0_0_20px_rgba(244,208,63,0.3)]'
                            : 'bg-white/5 border border-white/20 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {teamBLogos && (
                            <div className="w-6 h-6 relative flex-shrink-0">
                              <Image
                                src={teamBLogos.emblem}
                                alt={series.teamB}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span
                            className={`font-ui font-semibold text-sm truncate ${
                              series.winner === series.teamB ? 'font-bold' : ''
                            }`}
                            style={
                              series.winner === series.teamB && teamBConfig
                                ? { color: teamBConfig.primaryColor }
                                : { color: '#FFFFFF' }
                            }
                          >
                            {series.teamB}
                          </span>
                        </div>
                        <span className={`
                          font-mono font-bold text-2xl flex-shrink-0
                          ${series.winner === series.teamB ? 'text-arcade-yellow' : 'text-white/40'}
                        `}>
                          {series.winsB}
                        </span>
                      </div>

                      {/* Games List */}
                      {series.games.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs font-ui font-bold text-white/60 uppercase tracking-wider mb-3">
                            Games
                          </p>
                          <div className="space-y-2">
                            {series.games.map((game, gameIdx) => {
                              const homeTeamConfig = getTeamByName(game.homeTeam);
                              const awayTeamConfig = getTeamByName(game.awayTeam);
                              const homeLogos = homeTeamConfig ? getTeamLogoPaths(homeTeamConfig.name) : null;
                              const awayLogos = awayTeamConfig ? getTeamLogoPaths(awayTeamConfig.name) : null;
                              const homeWon = game.played && game.homeScore !== undefined && game.awayScore !== undefined && game.homeScore > game.awayScore;
                              const awayWon = game.played && game.homeScore !== undefined && game.awayScore !== undefined && game.awayScore > game.homeScore;

                              const gameContent = (
                                <div className="flex justify-between items-center py-2 px-3">
                                  <span className="text-arcade-yellow font-mono font-bold text-xs">
                                    G{gameIdx + 1}
                                  </span>
                                  {game.played ? (
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        {homeLogos && (
                                          <div className="w-4 h-4 relative">
                                            <Image
                                              src={homeLogos.emblem}
                                              alt={game.homeTeam}
                                              width={16}
                                              height={16}
                                              className="object-contain"
                                            />
                                          </div>
                                        )}
                                        <span
                                          className="font-ui text-xs"
                                          style={
                                            homeWon && homeTeamConfig
                                              ? { color: homeTeamConfig.primaryColor, fontWeight: 'bold' }
                                              : { color: '#FFFFFF' }
                                          }
                                        >
                                          {homeTeamConfig?.shortName || game.homeTeam}
                                        </span>
                                        <span className="text-white font-mono font-bold text-xs">{game.homeScore}</span>
                                      </div>
                                      <span className="text-white/30">|</span>
                                      <div className="flex items-center gap-2">
                                        {awayLogos && (
                                          <div className="w-4 h-4 relative">
                                            <Image
                                              src={awayLogos.emblem}
                                              alt={game.awayTeam}
                                              width={16}
                                              height={16}
                                              className="object-contain"
                                            />
                                          </div>
                                        )}
                                        <span
                                          className="font-ui text-xs"
                                          style={
                                            awayWon && awayTeamConfig
                                              ? { color: awayTeamConfig.primaryColor, fontWeight: 'bold' }
                                              : { color: '#FFFFFF' }
                                          }
                                        >
                                          {awayTeamConfig?.shortName || game.awayTeam}
                                        </span>
                                        <span className="text-white font-mono font-bold text-xs">{game.awayScore}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-white/40 text-xs font-mono italic">
                                      {game.awayTeam} @ {game.homeTeam}
                                    </span>
                                  )}
                                </div>
                              );

                              return game.boxScoreUrl ? (
                                <a
                                  key={gameIdx}
                                  href={game.boxScoreUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    block bg-white/5 hover:bg-white/10
                                    border border-white/10 hover:border-arcade-cyan/50
                                    rounded-lg transition-all duration-300
                                    group/game
                                  "
                                >
                                  <div className="flex items-center justify-between">
                                    {gameContent}
                                    <ExternalLink className="w-3 h-3 text-white/40 group-hover/game:text-arcade-cyan mr-3 transition-colors" />
                                  </div>
                                </a>
                              ) : (
                                <div key={gameIdx} className="bg-white/5 border border-white/10 rounded-lg">
                                  {gameContent}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: bracket.length * 0.1 + 0.2 }}
        className="relative bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 overflow-hidden"
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] opacity-30 pointer-events-none animate-scan" />
        
        <div className="relative">
          <p className="font-display font-bold text-arcade-yellow mb-4 text-sm uppercase tracking-wider">
            How to Read the Bracket
          </p>
          <ul className="space-y-2 text-sm font-ui text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-arcade-cyan">•</span>
              <span>Numbers next to team names show wins in the series</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-cyan">•</span>
              <span>Yellow highlight indicates series winner</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-cyan">•</span>
              <span>Click games with external link icon to view box scores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-cyan">•</span>
              <span>TBD teams will be filled in as previous rounds complete</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
