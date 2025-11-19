'use client';

import { BracketRound, StandingsRow } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import Link from "next/link";
import Image from "next/image";
import SurfaceCard from "@/components/SurfaceCard";

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
    // Extract last word (usually the team name)
    const parts = teamName.split(' ');
    return parts[parts.length - 1];
  };
  if (bracket.length === 0) {
    return (
      <SurfaceCard className="p-8 text-center">
        <p className="text-lg font-display text-star-white">No playoff games scheduled yet.</p>
        <p className="mt-2 font-mono text-star-gray">Check back when the playoffs begin!</p>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-8">
      {bracket.map((round, roundIdx) => (
        <SurfaceCard key={roundIdx} className="p-6">
          {/* Round Header */}
          <div className="mb-6 pb-3 border-b border-star-gray/20">
            <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-solar-gold via-comet-yellow to-nebula-orange bg-clip-text text-transparent">
              {round.name}
            </h2>
          </div>

          {/* Series Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {round.series.map((series, seriesIdx) => {
              const teamAConfig = getTeamByName(series.teamA);
              const teamBConfig = getTeamByName(series.teamB);
              const teamALogos = teamAConfig ? getTeamLogoPaths(teamAConfig.name) : null;
              const teamBLogos = teamBConfig ? getTeamLogoPaths(teamBConfig.name) : null;

              return (
                <SurfaceCard
                  key={seriesIdx}
                  className="p-0 overflow-hidden hover:border-nebula-orange/50 hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Series Header */}
                  <div className="bg-space-blue/30 backdrop-blur-sm px-4 py-2 border-b border-cosmic-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-display font-semibold text-star-white uppercase tracking-wider">
                        {getTeamSeed(series.teamA)} {getShortName(series.teamA)} vs. {getTeamSeed(series.teamB)} {getShortName(series.teamB)}
                      </span>
                      {series.winner && (
                        <span className="text-xs font-display font-bold text-nebula-teal bg-nebula-teal/20 px-2 py-1 rounded border border-nebula-teal/30">
                          COMPLETE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Matchup */}
                  <div className="p-4 space-y-2">
                    {/* Team A */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        series.winner === series.teamA
                          ? 'bg-nebula-orange/20 border-2 border-nebula-orange/50'
                          : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {teamALogos && (
                          <div className="w-5 h-5 relative flex-shrink-0">
                            <Image
                              src={teamALogos.emblem}
                              alt={series.teamA}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span
                          className={`font-semibold font-mono text-sm ${
                            series.winner === series.teamA ? 'font-bold' : ''
                          }`}
                          style={
                            series.winner === series.teamA && teamAConfig
                              ? { color: teamAConfig.primaryColor }
                              : { color: '#E8EDF5' }
                          }
                        >
                          {series.teamA}
                        </span>
                      </div>
                      <span className={`text-xl font-bold font-mono ${
                        series.winner === series.teamA ? 'text-nebula-orange' : 'text-star-gray'
                      }`}>
                        {series.winsA}
                      </span>
                    </div>

                    {/* Team B */}
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        series.winner === series.teamB
                          ? 'bg-nebula-orange/20 border-2 border-nebula-orange/50'
                          : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {teamBLogos && (
                          <div className="w-5 h-5 relative flex-shrink-0">
                            <Image
                              src={teamBLogos.emblem}
                              alt={series.teamB}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span
                          className={`font-semibold font-mono text-sm ${
                            series.winner === series.teamB ? 'font-bold' : ''
                          }`}
                          style={
                            series.winner === series.teamB && teamBConfig
                              ? { color: teamBConfig.primaryColor }
                              : { color: '#E8EDF5' }
                          }
                        >
                          {series.teamB}
                        </span>
                      </div>
                      <span className={`text-xl font-bold font-mono ${
                        series.winner === series.teamB ? 'text-nebula-orange' : 'text-star-gray'
                      }`}>
                        {series.winsB}
                      </span>
                    </div>

                  {/* Games List */}
                  {series.games.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-star-gray/20">
                      <p className="text-xs font-display font-semibold text-star-gray uppercase tracking-wider mb-2">
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
                            <div className="text-sm flex justify-between items-center py-1.5 px-2 rounded font-mono">
                              <span className="text-solar-gold font-bold text-xs">
                                Game {gameIdx + 1}
                              </span>
                              {game.played ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    {homeLogos && (
                                      <div className="w-4 h-4 relative flex-shrink-0">
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
                                      className="font-medium text-xs"
                                      style={
                                        homeWon && homeTeamConfig
                                          ? { color: homeTeamConfig.primaryColor, fontWeight: 'bold' }
                                          : { color: '#E8EDF5' }
                                      }
                                    >
                                      {homeTeamConfig?.shortName || game.homeTeam}
                                    </span>
                                    <span className="text-star-white font-bold text-xs">{game.homeScore}</span>
                                  </div>
                                  <span className="text-star-gray/50 text-xs">|</span>
                                  <div className="flex items-center gap-1.5">
                                    {awayLogos && (
                                      <div className="w-4 h-4 relative flex-shrink-0">
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
                                      className="font-medium text-xs"
                                      style={
                                        awayWon && awayTeamConfig
                                          ? { color: awayTeamConfig.primaryColor, fontWeight: 'bold' }
                                          : { color: '#E8EDF5' }
                                      }
                                    >
                                      {awayTeamConfig?.shortName || game.awayTeam}
                                    </span>
                                    <span className="text-star-white font-bold text-xs">{game.awayScore}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-star-gray text-xs italic">
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
                              className="block bg-space-blue/20 hover:bg-space-blue/40 border border-cosmic-border hover:border-nebula-orange/50 rounded transition-all duration-300 cursor-pointer"
                            >
                              {gameContent}
                            </a>
                          ) : (
                            <div key={gameIdx} className="bg-space-blue/20 border border-cosmic-border rounded">
                              {gameContent}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                </SurfaceCard>
              );
            })}
          </div>
        </SurfaceCard>
      ))}

      {/* Legend */}
      <SurfaceCard className="p-6">
        <p className="font-display font-semibold text-nebula-orange mb-3 text-sm uppercase tracking-wider">
          How to Read the Bracket
        </p>
        <ul className="space-y-1.5 text-sm font-mono text-star-gray">
          <li>• Numbers next to team names show wins in the series</li>
          <li>• Orange highlight indicates series winner</li>
          <li>• Click 📊 to view individual game box scores</li>
          <li>• TBD teams will be filled in as previous rounds complete</li>
        </ul>
      </SurfaceCard>
    </div>
  );
}
