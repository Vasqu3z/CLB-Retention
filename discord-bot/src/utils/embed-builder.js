import { EmbedBuilder } from 'discord.js';
import { STAT_LABELS } from '../config/league-config.js';
import sheetsService from '../services/sheets-service.js';

const COLORS = {
  PRIMARY: 0x0099FF,
  SUCCESS: 0x00FF00,
  WARNING: 0xFFFF00,
  ERROR: 0xFF0000,
  INFO: 0x00FFFF
};

// Helper to remove leading zero from rate stats (e.g., ".250" instead of "0.250")
function formatRateStat(value) {
  if (typeof value === 'string' && value.startsWith('0.')) {
    return value.substring(1); // Remove leading "0"
  }
  return value;
}

export async function createPlayerStatsEmbed(playerData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${playerData.name}`)
    .setDescription(`**Team:** ${playerData.team}\n**Games:** ${playerData.hitting.gp || playerData.pitching.gp || playerData.fielding.gp}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add player headshot thumbnail
  const playerImageUrl = await sheetsService.getImageUrl(playerData.name, 'player');
  if (playerImageUrl) {
    embed.setThumbnail(playerImageUrl);
  }

  const hasHittingStats = Object.values(playerData.hitting).some(val => val !== '0');
  if (hasHittingStats) {
    const hittingStats = [
      `AB: **${playerData.hitting.ab}**`,
      `AVG: **${playerData.hitting.avg}**`,
      `HR: **${playerData.hitting.hr}**`,
      `RBI: **${playerData.hitting.rbi}**`,
      `SLG: **${playerData.hitting.slg}**`,
      `OPS: **${playerData.hitting.ops}**`
    ].join('\n');

    embed.addFields({
      name: 'Hitting Stats',
      value: hittingStats,
      inline: false
    });
  }

  const hasPitchingStats = Object.values(playerData.pitching).some(val => val !== '0');
  if (hasPitchingStats) {
    const pitchingStats = [
      `IP: **${playerData.pitching.ip}**`,
      `W-L: **${playerData.pitching.w}-${playerData.pitching.l}**`,
      `SV: **${playerData.pitching.sv}**`,
      `ERA: **${playerData.pitching.era}**`,
      `WHIP: **${playerData.pitching.whip}**`,
      `BAA: **${playerData.pitching.baa}**`
    ].join('\n');

    embed.addFields({
      name: 'Pitching Stats',
      value: pitchingStats,
      inline: false
    });
  }

  const hasFieldingStats = Object.values(playerData.fielding).some(val => val !== '0');
  if (hasFieldingStats) {
    const fieldingStats = [
      `NP: **${playerData.fielding.np}**`,
      `E: **${playerData.fielding.e}**`,
      `SB: **${playerData.fielding.sb}**`
    ].join('\n');

    embed.addFields({
      name: 'Fielding Stats',
      value: fieldingStats,
      inline: false
    });
  }

  if (!hasHittingStats && !hasPitchingStats && !hasFieldingStats) {
    embed.setDescription(`${embed.data.description}\n\n*No stats available for this player yet.*`);
  }

  return embed;
}

export async function createTeamStatsEmbed(teamData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${teamData.name}`)
    .setDescription(`**General Manager:** ${teamData.captain}\n**Record:** ${teamData.wins}-${teamData.losses} (${formatRateStat((parseInt(teamData.wins) / parseInt(teamData.gp) || 0).toFixed(3))})`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add team icon thumbnail
  const teamImageUrl = await sheetsService.getImageUrl(teamData.name, 'team');
  if (teamImageUrl) {
    embed.setThumbnail(teamImageUrl);
  }

  // Team Hitting
  if (teamData.hitting) {
    const hittingStats = [
      `Runs Scored / Game: **${teamData.hitting.runsPerGame}**`,
      `AB: **${teamData.hitting.ab}**`,
      `AVG: **${formatRateStat(teamData.hitting.avg)}**`,
      `HR: **${teamData.hitting.hr}**`,
      `RBI: **${teamData.hitting.rbi}**`,
      `SLG: **${formatRateStat(teamData.hitting.slg)}**`,
      `OPS: **${formatRateStat(teamData.hitting.ops)}**`
    ].join('\n');

    embed.addFields({
      name: 'Hitting Stats',
      value: hittingStats,
      inline: false
    });
  }

  // Team Pitching
  if (teamData.pitching) {
    const gp = parseInt(teamData.gp) || 1;
    const runsAllowedPerGame = (parseInt(teamData.pitching.r) / gp).toFixed(2);

    const pitchingStats = [
      `Runs Allowed / Game: **${runsAllowedPerGame}**`,
      `WHIP: **${formatRateStat(teamData.pitching.whip)}**`,
      `BAA: **${formatRateStat(teamData.pitching.baa)}**`
    ].join('\n');

    embed.addFields({
      name: 'Pitching Stats',
      value: pitchingStats,
      inline: false
    });
  }

  // Team Fielding
  if (teamData.fielding) {
    const fieldingStats = [
      `Nice Plays / Game: **${teamData.fielding.npPerGame}**`,
      `E: **${teamData.fielding.e}**`,
      `SB: **${teamData.fielding.sb}**`
    ].join('\n');

    embed.addFields({
      name: 'Fielding Stats',
      value: fieldingStats,
      inline: false
    });
  }

  return embed;
}

export async function createStandingsEmbed(standings) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('League Standings')
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  if (standings.length === 0) {
    embed.setDescription('No standings available yet.');
    return embed;
  }

  // Calculate games back
  const firstPlaceWins = parseInt(standings[0].wins);
  const firstPlaceLosses = parseInt(standings[0].losses);

  // Helper function to pad strings for alignment
  const pad = (str, length) => str.toString().padEnd(length, ' ');

  // Build table with monospace formatting (no emojis for consistent spacing)
  let table = '```\n';
  table += `${pad('RK', 4)} ${pad('TEAM', 20)} ${pad('W-L', 8)} ${pad('PCT', 5)} ${pad('GB', 6)} ${pad('RD', 5)}\n`;
  table += '─'.repeat(53) + '\n';

  standings.forEach(team => {
    const wins = parseInt(team.wins);
    const losses = parseInt(team.losses);
    const gb = team.rank == 1 ? '-' : (((firstPlaceWins - wins) + (losses - firstPlaceLosses)) / 2).toFixed(1);

    const rankDisplay = team.rank.toString();
    const record = `${team.wins}-${team.losses}`;

    table += `${pad(rankDisplay, 4)} ${pad(team.team, 20)} ${pad(record, 8)} ${pad(team.winPct, 5)} ${pad(gb, 6)} ${pad(team.runDiff, 5)}\n`;
  });

  table += '```';

  embed.setDescription(table);

  return embed;
}

export function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

export function createInfoEmbed(title, message) {
  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(title)
    .setDescription(message)
    .setTimestamp();
}

export async function createRankingsEmbed(statLabel, leaders, format) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`League Leaders - ${statLabel}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  if (leaders.length === 0) {
    embed.setDescription('No qualified players for this stat.');
    return embed;
  }

  const formatValue = (value, format) => {
    if (format === 'int') {
      return value.toString();
    } else if (format === '.000') {
      return value.toFixed(3);
    } else if (format === '.00') {
      return value.toFixed(2);
    } else if (format === 'decimal') {
      return value.toFixed(1);
    }
    return value.toString();
  };

  // Helper function to pad strings for alignment
  const pad = (str, length) => str.toString().padEnd(length, ' ');

  // Build table with monospace formatting (no emojis for consistent spacing)
  let table = '```\n';
  table += `${pad('RK', 4)} ${pad('PLAYER', 20)} ${pad('TEAM', 18)} ${pad(statLabel.toUpperCase(), 8)}\n`;
  table += '─'.repeat(54) + '\n';

  leaders.forEach((leader, index) => {
    const rankDisplay = (index + 1).toString();
    const formattedValue = formatValue(leader.value, format);

    table += `${pad(rankDisplay, 4)} ${pad(leader.name, 20)} ${pad(leader.team, 18)} ${pad(formattedValue, 8)}\n`;
  });

  table += '```';

  embed.setDescription(table);

  return embed;
}

export async function createRosterEmbed(roster) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${roster.teamName} Roster`)
    .setDescription(`General Manager: ${roster.captain}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add team icon thumbnail
  const teamImageUrl = await sheetsService.getImageUrl(roster.teamName, 'team');
  if (teamImageUrl) {
    embed.setThumbnail(teamImageUrl);
  }

  const playerList = roster.players.map((player, index) => `${index + 1}. ${player}`).join('\n');

  embed.addFields({
    name: 'Players',
    value: playerList || 'No players',
    inline: false
  });

  return embed;
}

export async function createScheduleEmbed(games, filter, filterValue) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add image based on filter type
  if (filter.type === 'team') {
    // Team schedule - use team icon
    const teamImageUrl = await sheetsService.getImageUrl(filterValue, 'team');
    if (teamImageUrl) {
      embed.setThumbnail(teamImageUrl);
    }
  } else {
    // League schedule - use league logo
    const leagueImageUrl = await sheetsService.getImageUrl('League', 'league');
    if (leagueImageUrl) {
      embed.setThumbnail(leagueImageUrl);
    }
  }

  // Set title based on filter type
  let title = 'League Schedule';
  if (filter.type === 'recent') {
    title = `Recent Games - Week ${games[0]?.week || '?'}`;
  } else if (filter.type === 'current') {
    title = `Current Week - Week ${games[0]?.week || '?'}`;
  } else if (filter.type === 'upcoming') {
    title = `Upcoming Games - Week ${games[0]?.week || '?'}`;
  } else if (filter.type === 'team') {
    title = `${filterValue} Schedule`;
  }

  embed.setTitle(title);

  // Group games by week for team schedules
  const gamesByWeek = {};
  games.forEach(game => {
    const weekKey = `Week ${game.week}`;
    if (!gamesByWeek[weekKey]) {
      gamesByWeek[weekKey] = [];
    }
    gamesByWeek[weekKey].push(game);
  });

  // Build schedule display
  const weekKeys = Object.keys(gamesByWeek).sort((a, b) => {
    const numA = parseInt(a.replace('Week ', ''));
    const numB = parseInt(b.replace('Week ', ''));
    return numA - numB;
  });

  let scheduleText = '';

  weekKeys.forEach(weekKey => {
    const weekGames = gamesByWeek[weekKey];

    if (filter.type === 'team') {
      // For team schedules, show week header
      scheduleText += `**${weekKey}**\n`;
    }

    weekGames.forEach(game => {
      let gameText = '';

      if (game.played && game.result) {
        // Completed game with result
        // Parse result: "Team1: Score1 || Team2: Score2"
        const parts = game.result.split('||').map(p => p.trim());
        const team1Part = parts[0] || '';
        const team2Part = parts[1] || '';

        const team1Match = team1Part.match(/^(.+):\s*(\d+)$/);
        const team2Match = team2Part.match(/^(.+):\s*(\d+)$/);

        if (team1Match && team2Match) {
          const team1Name = team1Match[1].trim();
          const team1Score = team1Match[2];
          const team2Name = team2Match[1].trim();
          const team2Score = team2Match[2];

          // Determine which team is home/away
          let awayTeam, awayScore, homeTeam, homeScore;
          if (game.homeTeam.toLowerCase().includes(team1Name.toLowerCase())) {
            homeTeam = team1Name;
            homeScore = team1Score;
            awayTeam = team2Name;
            awayScore = team2Score;
          } else {
            homeTeam = team2Name;
            homeScore = team2Score;
            awayTeam = team1Name;
            awayScore = team1Score;
          }

          // Determine winner for bolding
          const homeWon = parseInt(homeScore) > parseInt(awayScore);

          // Format with entire line as hyperlink
          if (game.boxScoreUrl) {
            if (homeWon) {
              gameText = `[${awayTeam} ${awayScore} @ **${homeTeam} ${homeScore}**](${game.boxScoreUrl})`;
            } else {
              gameText = `[**${awayTeam} ${awayScore}** @ ${homeTeam} ${homeScore}](${game.boxScoreUrl})`;
            }
          } else {
            // No box score URL, just format without link
            if (homeWon) {
              gameText = `${awayTeam} ${awayScore} @ **${homeTeam} ${homeScore}**`;
            } else {
              gameText = `**${awayTeam} ${awayScore}** @ ${homeTeam} ${homeScore}`;
            }
          }
        } else {
          // Fallback if parsing fails
          if (game.boxScoreUrl) {
            gameText = `[${game.awayTeam} @ ${game.homeTeam} (Completed)](${game.boxScoreUrl})`;
          } else {
            gameText = `${game.awayTeam} @ ${game.homeTeam} (Completed)`;
          }
        }
      } else {
        // Upcoming game
        gameText = `${game.awayTeam} @ ${game.homeTeam}`;
      }

      scheduleText += `${gameText}\n`;
    });

    if (filter.type === 'team') {
      scheduleText += '\n';
    }
  });

  embed.setDescription(scheduleText || 'No games to display.');

  return embed;
}
