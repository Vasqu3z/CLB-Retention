import { getStandings, getSchedule, getAllPlayers, getPlayoffSchedule, getAverageTeamGP, ScheduleGame, PlayoffGame, groupGamesBySeries } from '@/lib/sheets';
import { getTeamByName } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import { QUALIFICATION_THRESHOLDS } from '@/config/sheets';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

// Unified game type for recent games display
type RecentGame = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  boxScoreUrl?: string;
  week: number | string; // number for regular season, string for playoffs
};

export default async function Sidebar() {
  // Fetch data in parallel
  const [standings, schedule, playoffSchedule, players, avgTeamGP] = await Promise.all([
    getStandings(),
    getSchedule(),
    getPlayoffSchedule(),
    getAllPlayers(),
    getAverageTeamGP(),
  ]);

  // Combine regular season and playoff games
  const allCompletedGames: RecentGame[] = [
    ...schedule
      .filter(game => game.played)
      .map(game => ({
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeScore: game.homeScore!,
        awayScore: game.awayScore!,
        boxScoreUrl: game.boxScoreUrl,
        week: game.week,
      })),
    ...playoffSchedule
      .filter(game => game.played)
      .map(game => ({
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeScore: game.homeScore!,
        awayScore: game.awayScore!,
        boxScoreUrl: game.boxScoreUrl,
        week: game.code, // Use playoff code as "week" identifier
      })),
  ];

  // Get current week (highest week number from regular season)
  const currentWeek = schedule.length > 0
    ? Math.max(...schedule.map(g => g.week))
    : 0;

  // Helper function to parse playoff round info from code
  const parsePlayoffCode = (code: string) => {
    // Extract prefix (first 2 characters for CS/WC/KC)
    const prefix = code.substring(0, 2);
    const seriesMatch = code.match(/-([A-Z])$/);
    const series = seriesMatch ? seriesMatch[1] : null;

    let roundName = '';
    let roundOrder = 0;

    if (prefix === 'KC') {
      roundName = 'Kingdom Cup';
      roundOrder = 3;
    } else if (prefix === 'CS') {
      roundName = series ? `Castle Series ${series}` : 'Castle Series';
      roundOrder = 2;
    } else if (prefix === 'WC') {
      roundName = 'Wildcard Games';
      roundOrder = 1;
    }

    return { roundName, roundOrder, series };
  };

  // Separate regular season and playoff games
  const regularSeasonGames = allCompletedGames.filter(g => typeof g.week === 'number');
  const playoffGames = allCompletedGames.filter(g => typeof g.week === 'string');

  // Group playoff games by round TYPE (not individual series)
  // KC = 1 week, all CS (A+B) = 1 week, all WC = 1 week
  const playoffWeeks: { roundName: string; roundOrder: number; series: { [key: string]: RecentGame[] } }[] = [];

  playoffGames.forEach(game => {
    const { roundName, roundOrder, series } = parsePlayoffCode(game.week as string);
    const prefix = (game.week as string).substring(0, 2);

    // Find or create the week for this round type
    let week = playoffWeeks.find(w => w.roundOrder === roundOrder);
    if (!week) {
      week = { roundName: prefix === 'CS' ? 'Castle Series' : roundName, roundOrder, series: {} };
      playoffWeeks.push(week);
    }

    // Group games by series within the week
    const seriesKey = series ? roundName : 'main';
    if (!week.series[seriesKey]) {
      week.series[seriesKey] = [];
    }
    week.series[seriesKey].push(game);
  });

  // Sort weeks by order (most recent first)
  playoffWeeks.sort((a, b) => b.roundOrder - a.roundOrder);

  // Implement 2-week rule: Show only 2 most recent "weeks"
  const recentPlayoffWeeks = playoffWeeks.slice(0, 2); // Take up to 2 most recent playoff weeks
  const numPlayoffWeeks = recentPlayoffWeeks.length;
  const numRegularWeeksToShow = Math.max(0, 2 - numPlayoffWeeks); // Fill remaining slots with regular season weeks

  // Get current week and previous week regular season games (only if needed)
  const currentWeekGames = numRegularWeeksToShow >= 1 ? regularSeasonGames
    .filter(g => g.week === currentWeek)
    .reverse() : [];

  const previousWeekGames = numRegularWeeksToShow >= 2 ? regularSeasonGames
    .filter(g => g.week === currentWeek - 1)
    .reverse() : [];

  // Calculate qualification thresholds (same as Leaders page)
  const qualifyingAB = avgTeamGP * QUALIFICATION_THRESHOLDS.BATTING.AB_MULTIPLIER;
  const qualifyingIP = avgTeamGP * QUALIFICATION_THRESHOLDS.PITCHING.IP_MULTIPLIER;

  // Calculate league leaders with qualification
  const hitters = players.filter(p => p.ab && p.ab > 0);
  const qualifiedHitters = players.filter(p => p.ab && p.ab >= qualifyingAB);
  const pitchers = players.filter(p => p.ip && p.ip > 0);
  const qualifiedPitchers = players.filter(p => p.ip && p.ip >= qualifyingIP);

  // BA (Batting Average) leaders - requires qualification
  const baLeaders = [...qualifiedHitters]
    .sort((a, b) => parseFloat('0' + (b.avg || '.000')) - parseFloat('0' + (a.avg || '.000')))
    .slice(0, 3);

  // HR leaders - no qualification
  const hrLeaders = [...hitters]
    .sort((a, b) => (b.hr || 0) - (a.hr || 0))
    .slice(0, 3);

  // RBI leaders - no qualification
  const rbiLeaders = [...hitters]
    .sort((a, b) => (b.rbi || 0) - (a.rbi || 0))
    .slice(0, 3);

  // ERA leaders (lower is better) - requires qualification
  const eraLeaders = [...qualifiedPitchers]
    .sort((a, b) => parseFloat(a.era || '999') - parseFloat(b.era || '999'))
    .slice(0, 3);

  // NP (Nice Plays) leaders - no qualification
  const npLeaders = [...players]
    .filter(p => p.np && p.np > 0)
    .sort((a, b) => (b.np || 0) - (a.np || 0))
    .slice(0, 3);

  // Determine Kingdom Cup Champion
  const seriesMap = groupGamesBySeries(playoffSchedule);
  const kcSeries = Array.from(seriesMap.values()).find(series =>
    series.games.some(game => game.code.startsWith('KC'))
  );
  const kingdomCupChampion = kcSeries?.winner ? getTeamByName(kcSeries.winner) : null;
  const championLogos = kingdomCupChampion ? getTeamLogoPaths(kingdomCupChampion.name) : null;

  const topTeam = standings[0];
  const topTeamConfig = topTeam ? getTeamByName(topTeam.team) : null;
  const topTeamLogos = topTeamConfig ? getTeamLogoPaths(topTeamConfig.name) : null;
  const latestResult = allCompletedGames.at(-1);
  const upcomingGame = schedule.find((game) => !game.played);
  const topStandings = standings.slice(0, 4);
  const remainingStandings = standings.slice(4);
  const leaderSections = [
    { title: 'Batting Average', leaders: baLeaders, format: (player: any) => player.avg || '.000', accent: 'text-solar-gold' },
    { title: 'Home Runs', leaders: hrLeaders, format: (player: any) => player.hr ?? 0, accent: 'text-nebula-orange' },
    { title: 'Runs Batted In', leaders: rbiLeaders, format: (player: any) => player.rbi ?? 0, accent: 'text-nebula-coral' },
    { title: 'Earned Run Average', leaders: eraLeaders, format: (player: any) => player.era || '—', accent: 'text-nebula-cyan' },
    { title: 'Nice Plays', leaders: npLeaders, format: (player: any) => player.np ?? 0, accent: 'text-nebula-teal' },
  ];
  const hasRecentGames = recentPlayoffWeeks.length > 0 || currentWeekGames.length > 0 || previousWeekGames.length > 0;

  return (
    <div className="p-4 space-y-4">
      <SidebarCard title="Mission Highlights">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-nebula-orange">Top Seed</p>
            <div className="mt-2 flex items-center gap-3">
              {topTeamLogos?.emblem && (
                <div className="w-10 h-10 relative">
                  <Image src={topTeamLogos.emblem} alt={topTeam?.team || 'Top seed'} width={40} height={40} className="object-contain" />
                </div>
              )}
              <div>
                <p className="text-sm font-display text-star-white">{topTeam?.team || 'Standings syncing'}</p>
                <p className="text-xs font-mono text-star-gray">
                  {topTeam ? `${topTeam.wins}-${topTeam.losses} • ${topTeam.winPct}` : 'Check back soon'}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-nebula-teal">Latest Result</p>
            {latestResult ? (
              <div className="mt-2 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className={latestResult.homeScore > latestResult.awayScore ? 'font-bold text-star-white' : 'text-star-gray'}>
                    {latestResult.homeTeam}
                  </span>
                  <span>{latestResult.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={latestResult.awayScore > latestResult.homeScore ? 'font-bold text-star-white' : 'text-star-gray'}>
                    {latestResult.awayTeam}
                  </span>
                  <span>{latestResult.awayScore}</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-star-dim mt-2">{typeof latestResult.week === 'number' ? `Week ${latestResult.week}` : latestResult.week}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-star-gray">No results recorded yet.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-comet-yellow">Next Up</p>
            {upcomingGame ? (
              <div className="mt-2 text-xs font-mono">
                {upcomingGame.awayTeam} @ {upcomingGame.homeTeam}
                <p className="text-[10px] uppercase tracking-[0.4em] text-star-dim mt-1">Week {upcomingGame.week}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-star-gray">Season slate complete.</p>
            )}
          </div>
        </div>
      </SidebarCard>

      {kingdomCupChampion && championLogos && (
        <SidebarCard title="Kingdom Cup Champions">
          <Link href={`/teams/${kingdomCupChampion.slug}`} className="flex flex-col items-center text-center gap-3 group">
            <div className="w-32 h-16 relative flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src={championLogos.full}
                alt={`${kingdomCupChampion.name} - Kingdom Cup Champions`}
                width={128}
                height={64}
                className="object-contain drop-shadow-[0_0_16px_rgba(255,215,0,0.5)] group-hover:drop-shadow-[0_0_24px_rgba(255,215,0,0.8)] transition-all"
              />
            </div>
            <p className="text-xs font-mono text-star-gray">Season 1</p>
          </Link>
        </SidebarCard>
      )}

      <SidebarCard title="Standings Pulse">
        <div className="space-y-3">
          {topStandings.map((team) => {
            const teamConfig = getTeamByName(team.team);
            return (
              <Link
                key={team.rank}
                href={teamConfig ? `/teams/${teamConfig.slug}` : '#'}
                className="flex items-center justify-between rounded-lg border border-cosmic-border/40 px-3 py-2 hover:border-nebula-orange/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-star-dim w-5">{team.rank}</span>
                  <span className="text-sm font-semibold" style={{ color: teamConfig?.primaryColor }}>{teamConfig?.shortName || team.team}</span>
                </div>
                <span className="text-xs font-mono text-star-gray">{team.wins}-{team.losses} • {team.winPct}</span>
              </Link>
            );
          })}
          {remainingStandings.length > 0 && (
            <details className="rounded-lg border border-cosmic-border/40 px-3 py-2 text-xs text-star-gray">
              <summary className="cursor-pointer flex items-center justify-between [&::-webkit-details-marker]:hidden">
                <span>Show remaining teams</span>
                <span className="text-star-dim">▸</span>
              </summary>
              <div className="mt-2 space-y-1 font-mono">
                {remainingStandings.map((team) => (
                  <div key={team.rank} className="flex items-center justify-between">
                    <span>{team.rank}. {team.team}</span>
                    <span>{team.wins}-{team.losses}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
          <Link href="/standings" className="text-xs font-mono uppercase tracking-[0.3em] text-nebula-cyan inline-flex items-center gap-1">
            View standings
            <span>→</span>
          </Link>
        </div>
      </SidebarCard>

      <SidebarCard title="League Leaders" defaultOpen={false}>
        <div className="space-y-3">
          {leaderSections.map((section, idx) => (
            <details key={section.title} className="rounded-lg border border-cosmic-border/40 px-3 py-2" open={idx === 0}>
              <summary className="flex items-center justify-between text-xs font-mono uppercase tracking-wide cursor-pointer text-star-gray [&::-webkit-details-marker]:hidden">
                <span>{section.title}</span>
                <span className={`${section.accent} font-semibold`}>
                  {section.leaders[0] ? section.format(section.leaders[0]) : '—'}
                </span>
              </summary>
              <div className="mt-2 space-y-1 text-xs">
                {section.leaders.map((player, rank) => (
                  <div key={`${section.title}-${player.name}`} className="flex items-center justify-between text-star-white">
                    <span className="truncate">{rank + 1}. {player.name}</span>
                    <span className="font-mono">{section.format(player)}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </SidebarCard>

      {hasRecentGames && (
        <SidebarCard title="Recent Games" defaultOpen={false}>
          <div className="space-y-4 text-sm">
            {recentPlayoffWeeks.map((week, weekIdx) => {
              const seriesEntries = Object.entries(week.series);
              const hasMultipleSeries = seriesEntries.length > 1;

              return (
                <div key={`playoff-week-${weekIdx}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-star-gray uppercase tracking-wide">
                      {week.roundName}
                    </span>
                    <span className="text-xs text-star-gray/70">
                      {hasMultipleSeries ? `${seriesEntries.length} series` : `${seriesEntries[0][0]}`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {seriesEntries.map(([seriesName, games]) => (
                      <div key={seriesName}>
                        {hasMultipleSeries && (
                          <p className="text-[11px] font-mono text-star-gray uppercase tracking-wide mb-1">{seriesName}</p>
                        )}
                        <div className="grid gap-2">
                          {games.map((game, idx) => {
                            const homeTeam = getTeamByName(game.homeTeam);
                            const awayTeam = getTeamByName(game.awayTeam);
                            const homeWon = game.homeScore > game.awayScore;

                            const gameContent = (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className={homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}>
                                    {homeTeam?.shortName || game.homeTeam}
                                  </span>
                                  <span className="font-mono font-bold text-star-white">
                                    {game.homeScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={!homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}>
                                    {awayTeam?.shortName || game.awayTeam}
                                  </span>
                                  <span className="font-mono font-bold text-star-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                              </>
                            );

                            return game.boxScoreUrl ? (
                              <Link
                                key={`${seriesName}-${idx}`}
                                href={game.boxScoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                              >
                                {gameContent}
                              </Link>
                            ) : (
                              <div
                                key={`${seriesName}-${idx}`}
                                className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                              >
                                {gameContent}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {currentWeekGames.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">Week {currentWeek}</h4>
                <div className="space-y-2">
                  {currentWeekGames.map((game, idx) => {
                    const homeTeam = getTeamByName(game.homeTeam);
                    const awayTeam = getTeamByName(game.awayTeam);
                    const homeWon = game.homeScore > game.awayScore;

                    const gameContent = (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}>
                            {homeTeam?.shortName || game.homeTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">{game.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={!homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}>
                            {awayTeam?.shortName || game.awayTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">{game.awayScore}</span>
                        </div>
                      </>
                    );

                    return game.boxScoreUrl ? (
                      <Link
                        key={`current-${idx}`}
                        href={game.boxScoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                      >
                        {gameContent}
                      </Link>
                    ) : (
                      <div
                        key={`current-${idx}`}
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                      >
                        {gameContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {previousWeekGames.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">Week {currentWeek - 1}</h4>
                <div className="space-y-2">
                  {previousWeekGames.map((game, idx) => {
                    const homeTeam = getTeamByName(game.homeTeam);
                    const awayTeam = getTeamByName(game.awayTeam);
                    const homeWon = game.homeScore > game.awayScore;

                    const gameContent = (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}>
                            {homeTeam?.shortName || game.homeTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">{game.homeScore}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={!homeWon ? 'font-bold' : 'text-star-gray'} style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}>
                            {awayTeam?.shortName || game.awayTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">{game.awayScore}</span>
                        </div>
                      </>
                    );

                    return game.boxScoreUrl ? (
                      <Link
                        key={`previous-${idx}`}
                        href={game.boxScoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                      >
                        {gameContent}
                      </Link>
                    ) : (
                      <div
                        key={`previous-${idx}`}
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                      >
                        {gameContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </SidebarCard>
      )}
    </div>
  );
}

interface SidebarCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

function SidebarCard({ title, children, defaultOpen = true }: SidebarCardProps) {
  return (
    <details open={defaultOpen} className="glass-card border border-cosmic-border/70">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-xs font-mono uppercase tracking-[0.3em] text-star-gray [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="text-star-dim">▾</span>
      </summary>
      <div className="px-4 py-4 space-y-4 text-sm">
        {children}
      </div>
    </details>
  );
}
