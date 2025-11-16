'use client';

import { ScheduleGame } from '@/lib/sheets';
import { Team, getTeamByName } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import Image from 'next/image';

interface ScheduleViewProps {
  schedule: ScheduleGame[];
  teams: Team[];
}

export default function ScheduleView({ schedule }: ScheduleViewProps) {
  // Group games by week
  const gamesByWeek = schedule.reduce((acc, game) => {
    const weekKey = `Week ${game.week}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(game);
    return acc;
  }, {} as Record<string, ScheduleGame[]>);

  // Sort weeks numerically
  const weekKeys = Object.keys(gamesByWeek).sort((a, b) => {
    const weekA = parseInt(a.replace('Week ', ''));
    const weekB = parseInt(b.replace('Week ', ''));
    return weekA - weekB;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-12">
        {weekKeys.map((weekKey) => {
          const weekGames = gamesByWeek[weekKey];

          return (
            <div key={weekKey} className="glass-card p-6">
              {/* Week Header */}
              <div className="mb-6 pb-3 border-b border-star-gray/20">
                <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-nebula-cyan to-star-pink bg-clip-text text-transparent">
                  {weekKey}
                </h2>
              </div>

              {/* Game Cards - 4 per row on large screens */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {weekGames.map((game, idx) => (
                  <GameCard key={`${weekKey}-${idx}`} game={game} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="glass-card p-6">
        <p className="font-display font-semibold text-nebula-orange mb-3 text-sm uppercase tracking-wider">
          How to Read the Schedule
        </p>
        <ul className="space-y-1.5 text-sm font-mono text-star-gray">
          <li>• Cyan highlight indicates the winning team</li>
          <li>• Click a game card to view the full box score</li>
          <li>• Italic text shows upcoming games</li>
        </ul>
      </div>
    </div>
  );
}

function GameCard({ game }: { game: ScheduleGame }) {
  const homeTeamConfig = getTeamByName(game.homeTeam);
  const awayTeamConfig = getTeamByName(game.awayTeam);
  const homeLogos = homeTeamConfig ? getTeamLogoPaths(homeTeamConfig.name) : null;
  const awayLogos = awayTeamConfig ? getTeamLogoPaths(awayTeamConfig.name) : null;

  if (!game.played) {
    // Upcoming game
    return (
      <div className="glass-card p-0 overflow-hidden hover:border-nebula-cyan/50 transition-all duration-300">
        <div className="bg-space-blue/30 backdrop-blur-sm px-4 py-2 border-b border-cosmic-border">
          <span className="text-xs font-display font-semibold text-star-gray uppercase tracking-wider">Upcoming Game</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-space-blue/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {awayLogos && (
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image
                    src={awayLogos.emblem}
                    alt={game.awayTeam}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              )}
              <span className="font-semibold text-star-gray italic font-mono text-sm">{game.awayTeam}</span>
            </div>
            <span className="text-xs text-star-gray/50">@</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-space-blue/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {homeLogos && (
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image
                    src={homeLogos.emblem}
                    alt={game.homeTeam}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              )}
              <span className="font-semibold text-star-gray italic font-mono text-sm">{game.homeTeam}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed game
  const homeWon = game.winner === game.homeTeam;
  const awayWon = game.winner === game.awayTeam;

  const content = (
    <div className="bg-space-black/30 border border-star-gray/30 rounded-lg overflow-hidden hover:border-nebula-cyan/50 hover:scale-[1.02] transition-all duration-300 group">
      <div className="bg-space-black/50 px-4 py-2 border-b border-star-gray/20">
        <div className="flex justify-between items-center">
          <span className="text-xs font-display font-semibold text-solar-gold uppercase tracking-wider">Final</span>
          {game.boxScoreUrl && (
            <span className="text-xs text-nebula-cyan group-hover:text-nebula-teal transition-colors">
              View Box Score →
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            awayWon
              ? 'bg-nebula-cyan/20 border-2 border-nebula-cyan/50'
              : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
          }`}
        >
          <div className="flex items-center gap-2">
            {awayLogos && (
              <div className="w-5 h-5 relative flex-shrink-0">
                <Image
                  src={awayLogos.emblem}
                  alt={game.awayTeam}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            )}
            <span
              className={`font-semibold font-mono text-sm ${
                awayWon ? 'font-bold' : ''
              }`}
              style={awayWon && awayTeamConfig ? { color: awayTeamConfig.primaryColor } : undefined}
            >
              {game.awayTeam}
            </span>
          </div>
          <span className={`text-xl font-bold font-mono ${
            awayWon ? 'text-nebula-cyan' : 'text-star-gray'
          }`}>
            {game.awayScore}
          </span>
        </div>

        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            homeWon
              ? 'bg-nebula-cyan/20 border-2 border-nebula-cyan/50'
              : 'bg-space-blue/20 backdrop-blur-sm border border-cosmic-border'
          }`}
        >
          <div className="flex items-center gap-2">
            {homeLogos && (
              <div className="w-5 h-5 relative flex-shrink-0">
                <Image
                  src={homeLogos.emblem}
                  alt={game.homeTeam}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            )}
            <span
              className={`font-semibold font-mono text-sm ${
                homeWon ? 'font-bold' : ''
              }`}
              style={homeWon && homeTeamConfig ? { color: homeTeamConfig.primaryColor } : undefined}
            >
              {game.homeTeam}
            </span>
          </div>
          <span className={`text-xl font-bold font-mono ${
            homeWon ? 'text-nebula-cyan' : 'text-star-gray'
          }`}>
            {game.homeScore}
          </span>
        </div>

        {/* Game Details */}
        {(game.mvp || game.winningPitcher || game.losingPitcher) && (
          <div className="mt-3 pt-3 border-t border-star-gray/20">
            <p className="text-xs font-display font-semibold text-star-gray uppercase tracking-wider mb-2">
              Game Details
            </p>
            <div className="space-y-1.5 text-sm font-mono">
              {game.mvp && (
                <div className="flex justify-between">
                  <span className="text-nebula-orange font-bold">MVP:</span>
                  <span className="text-star-white">{game.mvp}</span>
                </div>
              )}
              {game.winningPitcher && (
                <div className="flex justify-between">
                  <span className="text-nebula-teal font-bold">W:</span>
                  <span className="text-star-white">{game.winningPitcher}</span>
                </div>
              )}
              {game.losingPitcher && (
                <div className="flex justify-between">
                  <span className="text-nebula-coral font-bold">L:</span>
                  <span className="text-star-white">{game.losingPitcher}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-solar-gold font-bold">SV:</span>
                <span className={game.savePitcher ? "text-star-white" : "text-star-gray italic"}>
                  {game.savePitcher || "None"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If box score URL exists, make card clickable
  if (game.boxScoreUrl) {
    return (
      <a
        href={game.boxScoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
}
