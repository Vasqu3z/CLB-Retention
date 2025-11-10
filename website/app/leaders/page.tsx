import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders, getCalculatedFieldingLeaders, LeaderEntry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds

type TabType = 'batting' | 'pitching' | 'fielding';

export default async function LeadersPage() {
  const [battingLeaders, pitchingLeaders, fieldingLeaders] = await Promise.all([
    getCalculatedBattingLeaders(),
    getCalculatedPitchingLeaders(),
    getCalculatedFieldingLeaders(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">League Leaders</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#batting" className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
            Batting
          </a>
          <a href="#pitching" className="border-transparent py-4 px-1 hover:border-gray-300 hover:text-gray-700">
            Pitching
          </a>
          <a href="#fielding" className="border-transparent py-4 px-1 hover:border-gray-300 hover:text-gray-700">
            Fielding
          </a>
        </nav>
      </div>

      {/* Batting Leaders */}
      <section id="batting" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Batting Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="On-Base Percentage (OBP)" leaders={battingLeaders.obp} />
          <LeaderCard title="Hits (H)" leaders={battingLeaders.hits} />
          <LeaderCard title="Home Runs (HR)" leaders={battingLeaders.hr} />
          <LeaderCard title="Runs Batted In (RBI)" leaders={battingLeaders.rbi} />
          <LeaderCard title="Slugging Percentage (SLG)" leaders={battingLeaders.slg} />
          <LeaderCard title="On-Base Plus Slugging (OPS)" leaders={battingLeaders.ops} />
        </div>
      </section>

      {/* Pitching Leaders */}
      <section id="pitching" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Pitching Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="Innings Pitched (IP)" leaders={pitchingLeaders.ip} />
          <LeaderCard title="Wins (W)" leaders={pitchingLeaders.wins} />
          <LeaderCard title="Losses (L)" leaders={pitchingLeaders.losses} />
          <LeaderCard title="Saves (SV)" leaders={pitchingLeaders.saves} />
          <LeaderCard title="Earned Run Average (ERA)" leaders={pitchingLeaders.era} />
          <LeaderCard title="Walks & Hits per IP (WHIP)" leaders={pitchingLeaders.whip} />
          <LeaderCard title="Batting Average Against (BAA)" leaders={pitchingLeaders.baa} />
        </div>
      </section>

      {/* Fielding Leaders */}
      <section id="fielding" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Fielding & Baserunning Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="Nice Plays (NP)" leaders={fieldingLeaders.nicePlays} />
          <LeaderCard title="Errors (E)" leaders={fieldingLeaders.errors} />
          <LeaderCard title="Stolen Bases (SB)" leaders={fieldingLeaders.stolenBases} />
        </div>
      </section>
    </div>
  );
}

function LeaderCard({ title, leaders }: { title: string; leaders: LeaderEntry[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="space-y-2">
        {leaders.length === 0 && (
          <p className="text-gray-500 text-sm italic">No leaders yet</p>
        )}
        {leaders.map((leader, idx) => {
          const teamConfig = leader.team ? getTeamByName(leader.team) : null;
          const isEven = idx % 2 === 1;

          if (leader.isTieSummary) {
            return (
              <div
                key={idx}
                className={`py-2 px-3 rounded text-sm ${isEven ? 'bg-gray-50' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {leader.rank}. {leader.player}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {leader.value}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`py-2 px-3 rounded text-sm ${isEven ? 'bg-gray-50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-600 mr-1">{leader.rank}.</span>
                  <span className="font-medium">{leader.player}</span>
                  {teamConfig && (
                    <Link
                      href={`/teams/${teamConfig.slug}`}
                      className="ml-2 text-xs hover:underline"
                      style={{ color: teamConfig.primaryColor }}
                    >
                      ({leader.team})
                    </Link>
                  )}
                  {!teamConfig && leader.team && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({leader.team})
                    </span>
                  )}
                </div>
                <span className="text-gray-900 font-semibold">
                  {leader.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
