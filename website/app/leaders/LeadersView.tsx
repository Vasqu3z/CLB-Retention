'use client';

import { useState } from 'react';
import { LeaderEntry } from "@/lib/sheets";
import { getTeamByName } from "@/config/league";
import { getTeamLogoPaths } from "@/lib/teamLogos";
import { playerNameToSlug } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import SeasonToggle from "@/components/SeasonToggle";
import StatTooltip from "@/components/StatTooltip";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" /> {/* Spacer */}
        <SeasonToggle isPlayoffs={isPlayoffs} onChange={setIsPlayoffs} />
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2">
        <nav className="flex space-x-2" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('batting')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'batting'
                ? 'bg-gradient-to-r from-nebula-orange to-nebula-coral text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Batting
          </button>
          <button
            onClick={() => setActiveTab('pitching')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'pitching'
                ? 'bg-gradient-to-r from-solar-gold to-comet-yellow text-space-black shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Pitching
          </button>
          <button
            onClick={() => setActiveTab('fielding')}
            className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold transition-all ${
              activeTab === 'fielding'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                : 'text-star-gray hover:text-star-white hover:bg-space-black/30'
            }`}
          >
            Fielding & Running
          </button>
        </nav>
      </div>

      {/* Batting Leaders */}
      {activeTab === 'batting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="Batting Average" abbr="AVG" leaders={battingLeaders.avg} />
          <LeaderCard title="Hits" abbr="H" leaders={battingLeaders.hits} />
          <LeaderCard title="Home Runs" abbr="HR" leaders={battingLeaders.hr} />
          <LeaderCard title="Runs Batted In" abbr="RBI" leaders={battingLeaders.rbi} />
          <LeaderCard title="Slugging Percentage" abbr="SLG" leaders={battingLeaders.slg} />
          <LeaderCard title="On-Base Plus Slugging" abbr="OPS" leaders={battingLeaders.ops} />
        </div>
      )}

      {/* Pitching Leaders */}
      {activeTab === 'pitching' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="Innings Pitched" abbr="IP" leaders={pitchingLeaders.ip} />
          <LeaderCard title="Wins" abbr="W" leaders={pitchingLeaders.wins} />
          <LeaderCard title="Losses" abbr="L" leaders={pitchingLeaders.losses} />
          <LeaderCard title="Saves" abbr="SV" leaders={pitchingLeaders.saves} />
          <LeaderCard title="Earned Run Average" abbr="ERA" leaders={pitchingLeaders.era} />
          <LeaderCard title="Walks & Hits per IP" abbr="WHIP" leaders={pitchingLeaders.whip} />
          <LeaderCard title="Batting Average Against" abbr="BAA" leaders={pitchingLeaders.baa} />
        </div>
      )}

      {/* Fielding Leaders */}
      {activeTab === 'fielding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LeaderCard title="Nice Plays" abbr="NP" leaders={fieldingLeaders.nicePlays} />
          <LeaderCard title="Errors" abbr="E" leaders={fieldingLeaders.errors} />
          <LeaderCard title="Stolen Bases" abbr="SB" leaders={fieldingLeaders.stolenBases} />
        </div>
      )}
    </div>
  );
}

function LeaderCard({ title, abbr, leaders }: { title: string; abbr: string; leaders: LeaderEntry[] }) {
  return (
    <div className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-star-gray/20">
        <h3 className="text-lg font-display font-semibold text-star-white">
          {title}
        </h3>
        <span className="text-xs font-mono text-nebula-orange font-bold">
          <StatTooltip stat={abbr} showIcon>
            {abbr}
          </StatTooltip>
        </span>
      </div>
      <div className="space-y-2">
        {leaders.length === 0 && (
          <p className="text-star-gray text-sm italic font-mono">No leaders yet</p>
        )}
        {leaders.map((leader, idx) => {
          const teamConfig = leader.team ? getTeamByName(leader.team) : null;
          const logos = teamConfig ? getTeamLogoPaths(teamConfig.name) : null;

          return (
            <div
              key={idx}
              className="py-2.5 px-3 rounded-lg bg-space-black/20 hover:bg-space-blue/30 transition-all duration-300 border border-star-gray/10 hover:border-nebula-orange/30"
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-solar-gold font-bold font-mono text-sm">{leader.rank}.</span>
                  {leader.isTieSummary ? (
                    <span className="font-medium italic text-star-gray font-mono text-sm">{leader.player}</span>
                  ) : (
                    <>
                      {logos && teamConfig && (
                        <Link
                          href={`/teams/${teamConfig.slug}`}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity"
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
                      <Link
                        href={`/players/${playerNameToSlug(leader.player)}`}
                        className="font-semibold text-star-white text-sm hover:text-nebula-orange transition-colors"
                      >
                        {leader.player}
                      </Link>
                    </>
                  )}
                </div>
                <span className="text-nebula-cyan font-bold font-mono text-base flex-shrink-0">
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
