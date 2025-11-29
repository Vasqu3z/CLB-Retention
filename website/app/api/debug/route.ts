import { NextResponse } from 'next/server';
import { getPlayerRegistry, getTeamRegistry, getStandings, getPlayoffSchedule } from '@/lib/sheets';

export async function GET() {
  try {
    const [playerRegistry, teamRegistry, standings, playoffSchedule] = await Promise.all([
      getPlayerRegistry(),
      getTeamRegistry(),
      getStandings(false),
      getPlayoffSchedule()
    ]);

    // Sample a few entries to check data
    const samplePlayer = playerRegistry[0];
    const sampleTeam = teamRegistry[0];
    const sampleStanding = standings[0];

    return NextResponse.json({
      playerRegistry: {
        total: playerRegistry.length,
        sample: samplePlayer,
        imageUrlsPopulated: playerRegistry.filter(p => p.imageUrl && p.imageUrl.trim() !== '').length,
        allPlayers: playerRegistry.map(p => ({
          name: p.playerName,
          imageUrl: p.imageUrl,
          hasImage: !!p.imageUrl && p.imageUrl.trim() !== ''
        }))
      },
      teamRegistry: {
        total: teamRegistry.length,
        sample: sampleTeam,
        logosPopulated: teamRegistry.filter(t => t.logoUrl && t.logoUrl.trim() !== '').length,
        emblemsPopulated: teamRegistry.filter(t => t.emblemUrl && t.emblemUrl.trim() !== '').length,
        allTeams: teamRegistry.map(t => ({
          name: t.teamName,
          logoUrl: t.logoUrl,
          emblemUrl: t.emblemUrl,
          hasLogo: !!t.logoUrl && t.logoUrl.trim() !== '',
          hasEmblem: !!t.emblemUrl && t.emblemUrl.trim() !== ''
        }))
      },
      standings: {
        total: standings.length,
        sample: sampleStanding,
        h2hNotesPopulated: standings.filter(s => s.h2hNote && s.h2hNote.trim() !== '').length,
        allStandings: standings.map(s => ({
          team: s.team,
          h2hNote: s.h2hNote,
          hasH2H: !!s.h2hNote && s.h2hNote.trim() !== ''
        }))
      },
      playoffSchedule: {
        total: playoffSchedule.length,
        sample: playoffSchedule[0] || null,
        allGames: playoffSchedule.map(g => ({
          code: g.code,
          homeTeam: g.homeTeam,
          awayTeam: g.awayTeam,
          played: g.played,
          winner: g.winner,
          homeScore: g.homeScore,
          awayScore: g.awayScore
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
