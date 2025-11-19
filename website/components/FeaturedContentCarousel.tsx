'use client';

import { useState, useEffect } from 'react';
import { StandingsRow, ScheduleGame, PlayerStats } from '@/lib/sheets';
import { getActiveTeams } from '@/config/league';
import { getTeamLogoPaths } from '@/lib/teamLogos';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { playerNameToSlug } from '@/lib/utils';

interface FeaturedContentCarouselProps {
  standings: StandingsRow[];
  recentGames: ScheduleGame[];
  allPlayers: PlayerStats[];
}

const STAT_ROTATION = ['BA', 'HR', 'RBI', 'SLG', 'OPS', 'W', 'SV', 'ERA', 'WHIP', 'BAA', 'NP'] as const;
type RotatingStat = typeof STAT_ROTATION[number];

export default function FeaturedContentCarousel({
  standings,
  recentGames,
  allPlayers,
}: FeaturedContentCarouselProps) {
  const [activeWidget, setActiveWidget] = useState(0);
  const [randomStat, setRandomStat] = useState<RotatingStat>('BA');
  const [isPaused, setIsPaused] = useState(false);

  const teams = getActiveTeams();

  // Select random stat on mount and when widget changes to leader widget
  useEffect(() => {
    if (activeWidget === 2) {
      const randomIndex = Math.floor(Math.random() * STAT_ROTATION.length);
      setRandomStat(STAT_ROTATION[randomIndex]);
    }
  }, [activeWidget]);

  // Auto-rotate every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveWidget((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextWidget = () => {
    setActiveWidget((prev) => (prev + 1) % 3);
  };

  const prevWidget = () => {
    setActiveWidget((prev) => (prev - 1 + 3) % 3);
  };

  // Widget 1: Champions/Standings Leader
  const championTeam = standings[0];
  const championConfig = championTeam ? teams.find(t => t.name === championTeam.team) : null;
  const championLogos = championConfig ? getTeamLogoPaths(championConfig.name) : null;

  const championsWidget = (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <Trophy className="w-16 h-16 text-solar-gold mb-4 animate-pulse" />
      <h3 className="text-2xl font-display font-bold text-solar-gold mb-2">
        Season Champions
      </h3>
      {championTeam && championConfig && championLogos && (
        <Link
          href={`/teams/${championConfig.slug}`}
          className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-300"
        >
          <div className="w-24 h-24 relative">
            <Image
              src={championLogos.full}
              alt={championConfig.name}
              width={96}
              height={96}
              className="object-contain drop-shadow-[0_0_20px_rgba(255,193,7,0.6)]"
            />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-star-white group-hover:text-nebula-orange transition-colors"
               style={{ color: championConfig.primaryColor }}>
              {championConfig.name}
            </p>
            <p className="text-xl text-star-gray font-mono mt-2">
              {championTeam.wins}-{championTeam.losses} ({championTeam.winPct})
            </p>
          </div>
        </Link>
      )}
    </div>
  );

  // Widget 2: Latest Game
  const latestGame = recentGames[0];
  const latestGameWidget = latestGame ? (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <Calendar className="w-12 h-12 text-nebula-teal mb-4" />
      <h3 className="text-xl font-display font-bold text-nebula-teal mb-6">
        Latest Game
      </h3>
      <div className="flex items-center gap-8">
        {/* Away Team */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-2">
            {(() => {
              const awayTeam = teams.find(t => t.name === latestGame.awayTeam);
              const awayLogos = awayTeam ? getTeamLogoPaths(awayTeam.name) : null;
              return awayLogos ? (
                <Image
                  src={awayLogos.emblem}
                  alt={latestGame.awayTeam}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              ) : null;
            })()}
          </div>
          <p className="text-sm font-display font-semibold text-star-gray">
            {latestGame.awayTeam}
          </p>
          <p className="text-3xl font-display font-bold text-star-white mt-2">
            {latestGame.awayScore}
          </p>
        </div>

        {/* VS */}
        <div className="text-2xl font-display font-bold text-star-dim">
          VS
        </div>

        {/* Home Team */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative mb-2">
            {(() => {
              const homeTeam = teams.find(t => t.name === latestGame.homeTeam);
              const homeLogos = homeTeam ? getTeamLogoPaths(homeTeam.name) : null;
              return homeLogos ? (
                <Image
                  src={homeLogos.emblem}
                  alt={latestGame.homeTeam}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              ) : null;
            })()}
          </div>
          <p className="text-sm font-display font-semibold text-star-gray">
            {latestGame.homeTeam}
          </p>
          <p className="text-3xl font-display font-bold text-star-white mt-2">
            {latestGame.homeScore}
          </p>
        </div>
      </div>
      <p className="text-sm text-star-dim font-mono mt-4">
        Week {latestGame.week}
      </p>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <p className="text-star-dim font-mono">No recent games</p>
    </div>
  );

  // Widget 3: League Leader (Random Stat)
  const getLeaderForStat = (stat: RotatingStat): PlayerStats | undefined => {
    let statKey: keyof PlayerStats = 'name';
    let isAscending = false;

    // Map stat abbreviations to PlayerStats keys
    if (stat === 'BA') statKey = 'avg';
    else if (stat === 'HR') statKey = 'hr';
    else if (stat === 'RBI') statKey = 'rbi';
    else if (stat === 'SLG') statKey = 'slg';
    else if (stat === 'OPS') statKey = 'ops';
    else if (stat === 'W') statKey = 'w';
    else if (stat === 'SV') statKey = 'sv';
    else if (stat === 'ERA') { statKey = 'era'; isAscending = true; }
    else if (stat === 'WHIP') { statKey = 'whip'; isAscending = true; }
    else if (stat === 'BAA') { statKey = 'baa'; isAscending = true; }
    else if (stat === 'NP') statKey = 'np';

    // Filter out players without the stat
    const playersWithStat = allPlayers.filter(p => p[statKey] != null && p[statKey] !== undefined);

    if (playersWithStat.length === 0) return undefined;

    // Sort by the stat
    const sorted = [...playersWithStat].sort((a, b) => {
      const aVal = typeof a[statKey] === 'number' ? a[statKey] as number : parseFloat(String(a[statKey]) || '0');
      const bVal = typeof b[statKey] === 'number' ? b[statKey] as number : parseFloat(String(b[statKey]) || '0');
      return isAscending ? aVal - bVal : bVal - aVal;
    });

    return sorted[0];
  };

  const leagueLeader = getLeaderForStat(randomStat);
  const leaderTeam = leagueLeader ? teams.find(t => t.name === leagueLeader.team) : null;

  const leaderWidget = leagueLeader ? (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <TrendingUp className="w-12 h-12 text-nebula-orange mb-4" />
      <h3 className="text-xl font-display font-bold text-nebula-orange mb-2">
        League Leader: {randomStat}
      </h3>
      <Link
        href={`/players/${playerNameToSlug(leagueLeader.name)}`}
        className="group flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300"
      >
        <p className="text-3xl font-display font-bold text-star-white group-hover:text-nebula-orange transition-colors">
          {leagueLeader.name}
        </p>
        {leaderTeam && (
          <p className="text-lg font-display font-semibold" style={{ color: leaderTeam.primaryColor }}>
            {leaderTeam.name}
          </p>
        )}
        <p className="text-4xl font-display font-bold text-nebula-cyan mt-2">
          {(() => {
            if (randomStat === 'BA') return leagueLeader.avg;
            if (randomStat === 'HR') return leagueLeader.hr;
            if (randomStat === 'RBI') return leagueLeader.rbi;
            if (randomStat === 'SLG') return leagueLeader.slg;
            if (randomStat === 'OPS') return leagueLeader.ops;
            if (randomStat === 'W') return leagueLeader.w;
            if (randomStat === 'SV') return leagueLeader.sv;
            if (randomStat === 'ERA') return leagueLeader.era;
            if (randomStat === 'WHIP') return leagueLeader.whip;
            if (randomStat === 'BAA') return leagueLeader.baa;
            if (randomStat === 'NP') return leagueLeader.np;
            return '—';
          })()}
        </p>
      </Link>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center">
      <p className="text-star-dim font-mono">No leader data</p>
    </div>
  );

  const widgets = [championsWidget, latestGameWidget, leaderWidget];

  return (
    <div
      className="relative glass-card overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Widget Display */}
      <div className="relative h-[400px]">
        {widgets[activeWidget]}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevWidget}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-space-navy/80 border border-cosmic-border hover:border-nebula-orange hover:bg-space-blue/80 transition-all duration-200 flex items-center justify-center"
        aria-label="Previous widget"
      >
        <ChevronLeft className="w-6 h-6 text-star-gray" />
      </button>
      <button
        onClick={nextWidget}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-space-navy/80 border border-cosmic-border hover:border-nebula-orange hover:bg-space-blue/80 transition-all duration-200 flex items-center justify-center"
        aria-label="Next widget"
      >
        <ChevronRight className="w-6 h-6 text-star-gray" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => setActiveWidget(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeWidget === idx
                ? 'bg-nebula-orange w-8'
                : 'bg-star-dim hover:bg-star-gray'
            }`}
            aria-label={`Go to widget ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
