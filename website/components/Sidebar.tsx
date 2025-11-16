import { getStandings, getSchedule, getAllPlayers } from '@/lib/sheets';
import { getTeamByName } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import Link from 'next/link';
import Image from 'next/image';

export default async function Sidebar() {
  // Fetch data in parallel
  const [standings, schedule, players] = await Promise.all([
    getStandings(),
    getSchedule(),
    getAllPlayers(),
  ]);

  // Get recent completed games (last 5)
  const recentGames = schedule
    .filter(game => game.played)
    .slice(-5)
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
    <aside className="w-80 bg-space-navy/80 backdrop-blur-glass border-r border-cosmic-border h-screen overflow-y-auto overscroll-contain sticky top-0">
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
        {recentGames.length > 0 && (
          <section>
            <h3 className="text-sm font-display font-semibold text-nebula-orange mb-3 uppercase tracking-wider">
              Recent Games
            </h3>
            <div className="space-y-2">
              {recentGames.map((game, idx) => {
                const homeTeam = getTeamByName(game.homeTeam);
                const awayTeam = getTeamByName(game.awayTeam);
                const homeWon = game.homeScore! > game.awayScore!;

                return (
                  <div key={idx} className="text-sm p-2 rounded-lg bg-space-blue/30 border border-cosmic-border">
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
                  </div>
                );
              })}
            </div>
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
    </aside>
  );
}
