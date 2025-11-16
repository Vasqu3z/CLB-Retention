import { getStandings, getSchedule, getAllPlayers, getPlayoffSchedule, ScheduleGame, PlayoffGame } from '@/lib/sheets';
import { getTeamByName } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import Link from 'next/link';
import Image from 'next/image';

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
  const [standings, schedule, playoffSchedule, players] = await Promise.all([
    getStandings(),
    getSchedule(),
    getPlayoffSchedule(),
    getAllPlayers(),
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

  // Group playoff games by round and series
  const playoffGamesByRound: { [key: string]: RecentGame[] } = {};
  playoffGames.forEach(game => {
    const { roundName } = parsePlayoffCode(game.week as string);
    if (!playoffGamesByRound[roundName]) {
      playoffGamesByRound[roundName] = [];
    }
    playoffGamesByRound[roundName].push(game);
  });

  // Sort playoff rounds by order (Kingdom Cup, then Castle Series, etc.)
  const sortedPlayoffRounds = Object.entries(playoffGamesByRound)
    .sort(([nameA], [nameB]) => {
      const orderA = parsePlayoffCode(playoffGamesByRound[nameA][0].week as string).roundOrder;
      const orderB = parsePlayoffCode(playoffGamesByRound[nameB][0].week as string).roundOrder;
      return orderB - orderA; // Descending (most recent first)
    });

  // Get current week and previous week regular season games
  const currentWeekGames = regularSeasonGames
    .filter(g => g.week === currentWeek)
    .reverse();

  const previousWeekGames = regularSeasonGames
    .filter(g => g.week === currentWeek - 1)
    .reverse();

  // Calculate league leaders
  const hitters = players.filter(p => p.ab && p.ab > 0);
  const pitchers = players.filter(p => p.ip && p.ip > 0);

  // BA (Batting Average) leaders
  const baLeaders = [...hitters]
    .sort((a, b) => parseFloat('0' + (b.avg || '.000')) - parseFloat('0' + (a.avg || '.000')))
    .slice(0, 3);

  // HR leaders
  const hrLeaders = [...hitters]
    .sort((a, b) => (b.hr || 0) - (a.hr || 0))
    .slice(0, 3);

  // RBI leaders
  const rbiLeaders = [...hitters]
    .sort((a, b) => (b.rbi || 0) - (a.rbi || 0))
    .slice(0, 3);

  // ERA leaders (lower is better)
  const eraLeaders = [...pitchers]
    .sort((a, b) => parseFloat(a.era || '999') - parseFloat(b.era || '999'))
    .slice(0, 3);

  // NP (Nice Plays) leaders
  const npLeaders = [...players]
    .filter(p => p.np && p.np > 0)
    .sort((a, b) => (b.np || 0) - (a.np || 0))
    .slice(0, 3);

  return (
    <div className="p-4 space-y-6">
        {/* Mini Standings */}
        <section>
          <h3 className="text-sm font-display font-semibold text-nebula-orange mb-3 uppercase tracking-wider">
            Standings
          </h3>
          <div className="space-y-1">
            {standings.slice(0, 8).map((team) => {
              const teamConfig = getTeamByName(team.team);
              const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

              return (
                <Link
                  key={team.rank}
                  href={teamConfig ? `/teams/${teamConfig.slug}` : '#'}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-space-blue/50 transition-all group"
                >
                  {/* Rank */}
                  <span className="text-sm font-mono text-star-dim w-6">
                    {team.rank}
                  </span>

                  {/* Team Emblem */}
                  {logos && (
                    <div className="w-6 h-6 relative flex-shrink-0">
                      <Image
                        src={logos.emblem}
                        alt={team.team}
                        width={24}
                        height={24}
                        className="object-contain group-hover:drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]"
                      />
                    </div>
                  )}

                  {/* Team Name (abbreviated on small screens) */}
                  <span
                    className="text-sm font-medium flex-1 truncate group-hover:text-nebula-orange transition-colors"
                    style={{ color: teamConfig?.primaryColor || 'var(--star-white)' }}
                  >
                    {teamConfig?.shortName || team.team}
                  </span>

                  {/* Record */}
                  <span className="text-sm font-mono text-star-gray">
                    {team.wins}-{team.losses}
                  </span>

                  {/* Win % */}
                  <span className="text-sm font-mono text-star-white font-semibold w-12 text-right">
                    {team.winPct}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Games */}
        {(sortedPlayoffRounds.length > 0 || currentWeekGames.length > 0 || previousWeekGames.length > 0) && (
          <section>
            <h3 className="text-sm font-display font-semibold text-nebula-orange mb-3 uppercase tracking-wider">
              Recent Games
            </h3>

            {/* Playoff Rounds (most recent first) */}
            {sortedPlayoffRounds.map(([roundName, games], roundIdx) => (
              <div key={roundName} className={roundIdx < sortedPlayoffRounds.length - 1 || currentWeekGames.length > 0 || previousWeekGames.length > 0 ? 'mb-4' : ''}>
                <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">
                  {roundName}
                </h4>
                <div className="space-y-2">
                  {games.map((game, idx) => {
                    const homeTeam = getTeamByName(game.homeTeam);
                    const awayTeam = getTeamByName(game.awayTeam);
                    const homeWon = game.homeScore > game.awayScore;

                    const gameContent = (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}
                          >
                            {homeTeam?.shortName || game.homeTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">
                            {game.homeScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={!homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}
                          >
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
                        key={idx}
                        href={game.boxScoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                      >
                        {gameContent}
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                      >
                        {gameContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Current Week Regular Season Games */}
            {currentWeekGames.length > 0 && (
              <div className={previousWeekGames.length > 0 ? 'mb-4' : ''}>
                <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">
                  Week {currentWeek}
                </h4>
                <div className="space-y-2">
                  {currentWeekGames.map((game, idx) => {
                    const homeTeam = getTeamByName(game.homeTeam);
                    const awayTeam = getTeamByName(game.awayTeam);
                    const homeWon = game.homeScore > game.awayScore;

                    const gameContent = (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}
                          >
                            {homeTeam?.shortName || game.homeTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">
                            {game.homeScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={!homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}
                          >
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
                        key={idx}
                        href={game.boxScoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                      >
                        {gameContent}
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                      >
                        {gameContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Previous Week Regular Season Games */}
            {previousWeekGames.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">
                  Week {currentWeek - 1}
                </h4>
                <div className="space-y-2">
                  {previousWeekGames.map((game, idx) => {
                    const homeTeam = getTeamByName(game.homeTeam);
                    const awayTeam = getTeamByName(game.awayTeam);
                    const homeWon = game.homeScore > game.awayScore;

                    const gameContent = (
                      <>
                        <div className="flex items-center justify-between">
                          <span
                            className={homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: homeWon ? homeTeam?.primaryColor : undefined }}
                          >
                            {homeTeam?.shortName || game.homeTeam}
                          </span>
                          <span className="font-mono font-bold text-star-white">
                            {game.homeScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className={!homeWon ? 'font-bold' : 'text-star-gray'}
                            style={{ color: !homeWon ? awayTeam?.primaryColor : undefined }}
                          >
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
                        key={idx}
                        href={game.boxScoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block hover:border-nebula-orange/50 hover:bg-space-blue/50 hover:scale-105 cursor-pointer"
                      >
                        {gameContent}
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border transition-all duration-300 block"
                      >
                        {gameContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* League Leaders */}
        <section>
          <h3 className="text-sm font-display font-semibold text-nebula-orange mb-3 uppercase tracking-wider">
            League Leaders
          </h3>

          {/* BA Leaders */}
          <div className="mb-4">
            <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">Batting Average</h4>
            <div className="space-y-1">
              {baLeaders.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-star-white truncate flex-1 min-w-0">
                    {player.name}
                  </span>
                  <span className="font-mono font-bold text-solar-gold flex-shrink-0">
                    {player.avg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HR Leaders */}
          <div className="mb-4">
            <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">Home Runs</h4>
            <div className="space-y-1">
              {hrLeaders.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-star-white truncate flex-1 min-w-0">
                    {player.name}
                  </span>
                  <span className="font-mono font-bold text-nebula-orange flex-shrink-0">
                    {player.hr}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RBI Leaders */}
          <div className="mb-4">
            <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">RBI</h4>
            <div className="space-y-1">
              {rbiLeaders.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-star-white truncate flex-1 min-w-0">
                    {player.name}
                  </span>
                  <span className="font-mono font-bold text-nebula-coral flex-shrink-0">
                    {player.rbi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ERA Leaders */}
          <div className="mb-4">
            <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">ERA</h4>
            <div className="space-y-1">
              {eraLeaders.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-star-white truncate flex-1 min-w-0">
                    {player.name}
                  </span>
                  <span className="font-mono font-bold text-nebula-cyan flex-shrink-0">
                    {player.era}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NP Leaders */}
          <div>
            <h4 className="text-xs font-mono text-star-gray mb-2 uppercase tracking-wide">Nice Plays</h4>
            <div className="space-y-1">
              {npLeaders.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-star-white truncate flex-1 min-w-0">
                    {player.name}
                  </span>
                  <span className="font-mono font-bold text-nebula-teal flex-shrink-0">
                    {player.np}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
  );
}
