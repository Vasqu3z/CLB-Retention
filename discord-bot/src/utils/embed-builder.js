/**
 * @file embed-builder.js
 * @description Discord embed creation utilities for CLB League Hub Bot
 *
 * Purpose:
 * - Build formatted Discord embeds for all bot commands
 * - Apply consistent styling, colors, and formatting across responses
 * - Handle image attachments (player headshots, team icons, league logo)
 *
 * Key Responsibilities:
 * - Create player stats embeds (hitting, pitching, fielding)
 * - Create team stats and standings embeds
 * - Create schedule and scores embeds with hyperlinks
 * - Create rankings/leaderboard tables
 * - Create comparison tables for head-to-head stats
 * - Format tables using monospace blocks with proper alignment
 *
 * Data Dependencies:
 * - league-config.js (formatting constants, stat labels)
 * - sheets-service.js (image URLs)
 *
 * Formatting Standards:
 * - Uses EMBED_FORMATTING constants for all widths and separators (P2: No Magic Numbers)
 * - Monospace code blocks for tables with fixed-width columns
 * - Bold markdown for emphasis on stat values
 * - Separator lines using configurable character
 */

import { EmbedBuilder } from 'discord.js';
import { STAT_LABELS, EMBED_FORMATTING } from '../config/league-config.js';
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
  table += `${pad('RK', EMBED_FORMATTING.STANDINGS_RANK_WIDTH)} ${pad('TEAM', EMBED_FORMATTING.STANDINGS_TEAM_WIDTH)} ${pad('W-L', EMBED_FORMATTING.STANDINGS_RECORD_WIDTH)} ${pad('PCT', EMBED_FORMATTING.STANDINGS_PCT_WIDTH)} ${pad('GB', EMBED_FORMATTING.STANDINGS_GB_WIDTH)} ${pad('DIFF', EMBED_FORMATTING.STANDINGS_DIFF_WIDTH)}\n`;
  table += EMBED_FORMATTING.SEPARATOR_CHAR.repeat(EMBED_FORMATTING.STANDINGS_TOTAL_WIDTH) + '\n';

  standings.forEach(team => {
    const wins = parseInt(team.wins);
    const losses = parseInt(team.losses);
    const gb = team.rank == 1 ? '-' : (((firstPlaceWins - wins) + (losses - firstPlaceLosses)) / 2).toFixed(1);

    const rankDisplay = team.rank.toString();
    const record = `${team.wins}-${team.losses}`;
    const diffDisplay = parseInt(team.runDiff) >= 0 ? `+${team.runDiff}` : team.runDiff.toString();

    table += `${pad(rankDisplay, 4)} ${pad(team.team, 20)} ${pad(record, 8)} ${pad(team.winPct, 5)} ${pad(gb, 6)} ${pad(diffDisplay, 6)}\n`;
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

export async function createRankingsEmbed(statFullName, leaders, format, statLabel = null) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`League Leaders - ${statFullName}`)
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
      return formatRateStat(value.toFixed(3));
    } else if (format === '.00') {
      return formatRateStat(value.toFixed(2));
    } else if (format === 'decimal') {
      return value.toFixed(1);
    }
    return value.toString();
  };

  // Helper function to pad strings for alignment
  const pad = (str, length) => str.toString().padEnd(length, ' ');

  // Use abbreviated label for table column, or fallback to full name if not provided
  const columnHeader = (statLabel || statFullName).toUpperCase();

  // Build table with monospace formatting (no emojis for consistent spacing)
  let table = '```\n';
  table += `${pad('RK', EMBED_FORMATTING.RANKINGS_RANK_WIDTH)} ${pad('PLAYER', EMBED_FORMATTING.RANKINGS_NAME_WIDTH + 7)} ${pad('TEAM', EMBED_FORMATTING.RANKINGS_TEAM_WIDTH + 5)} ${pad(columnHeader, EMBED_FORMATTING.RANKINGS_STAT_WIDTH + 2)}\n`;
  table += EMBED_FORMATTING.SEPARATOR_CHAR.repeat(EMBED_FORMATTING.RANKINGS_TOTAL_WIDTH + 12) + '\n';

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
  } else if (filter.type === 'week') {
    title = `Week ${filter.weekNumber} Schedule`;
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

  weekKeys.forEach((weekKey, weekIndex) => {
    const weekGames = gamesByWeek[weekKey];

    if (filter.type === 'team') {
      // For team schedules, show week header inline
      scheduleText += `**${weekKey}:** `;
    }

    weekGames.forEach((game, gameIndex) => {
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

      // For team schedules, put first game on same line as week header
      if (filter.type === 'team' && gameIndex === 0) {
        scheduleText += `${gameText}\n`;
      } else {
        scheduleText += `${gameText}\n`;
      }
    });
  });

  embed.setDescription(scheduleText || 'No games to display.');

  return embed;
}

export async function createHeadToHeadEmbed(matchupData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${matchupData.team1} vs ${matchupData.team2}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add league logo as thumbnail
  const leagueImageUrl = await sheetsService.getImageUrl('League', 'league');
  if (leagueImageUrl) {
    embed.setThumbnail(leagueImageUrl);
  }

  // Overall record
  const recordText = `**Overall Record:** ${matchupData.team1Wins}-${matchupData.team2Wins}\n` +
    `**${matchupData.team1} Avg:** ${matchupData.avgScoreTeam1} runs/game\n` +
    `**${matchupData.team2} Avg:** ${matchupData.avgScoreTeam2} runs/game\n` +
    `**Total Games:** ${matchupData.totalGames}`;

  embed.setDescription(recordText);

  // List all games
  let gamesText = '';
  matchupData.games.forEach(game => {
    const team1Lower = matchupData.team1.toLowerCase();
    const team2Lower = matchupData.team2.toLowerCase();

    // Determine which team is which in this game
    let displayTeam1, displayScore1, displayTeam2, displayScore2;
    if (game.team1.toLowerCase().includes(team1Lower)) {
      displayTeam1 = game.team1;
      displayScore1 = game.score1;
      displayTeam2 = game.team2;
      displayScore2 = game.score2;
    } else {
      displayTeam1 = game.team2;
      displayScore1 = game.score2;
      displayTeam2 = game.team1;
      displayScore2 = game.score1;
    }

    // Bold the winner
    let gameText;
    if (displayScore1 > displayScore2) {
      gameText = `**Week ${game.week}:** **${displayTeam1} ${displayScore1}** vs ${displayTeam2} ${displayScore2}`;
    } else {
      gameText = `**Week ${game.week}:** ${displayTeam1} ${displayScore1} vs **${displayTeam2} ${displayScore2}**`;
    }

    // Add box score link if available
    if (game.boxScoreUrl) {
      gameText = `[${gameText}](${game.boxScoreUrl})`;
    }

    gamesText += `${gameText}\n`;
  });

  embed.addFields({
    name: 'Game Results',
    value: gamesText || 'No games played yet.',
    inline: false
  });

  return embed;
}

export function createPlayerCompareEmbed(player1Data, player2Data) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${player1Data.name} vs ${player2Data.name}`)
    .setDescription(`**${player1Data.name}'s Team:** ${player1Data.team}\n**${player2Data.name}'s Team:** ${player2Data.team}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Helper to determine if a player has meaningful stats in a category
  const hasStats = (playerData, category) => {
    return Object.values(playerData[category]).some(val => val !== '0' && val !== '.000' && val !== '0.00');
  };

  // Helper to compare two values and add visual indicator (* on right for better value)
  const compareValues = (val1, val2, higherIsBetter = true) => {
    const num1 = parseFloat(val1) || 0;
    const num2 = parseFloat(val2) || 0;

    if (num1 === num2) {
      return { p1: val1, p2: val2 };
    }

    if (higherIsBetter) {
      return {
        p1: num1 > num2 ? `${val1}${EMBED_FORMATTING.BETTER_STAT_MARKER}` : val1,
        p2: num2 > num1 ? `${val2}${EMBED_FORMATTING.BETTER_STAT_MARKER}` : val2
      };
    } else {
      return {
        p1: num1 < num2 ? `${val1}${EMBED_FORMATTING.BETTER_STAT_MARKER}` : val1,
        p2: num2 < num1 ? `${val2}${EMBED_FORMATTING.BETTER_STAT_MARKER}` : val2
      };
    }
  };

  // Hitting comparison
  const p1HasHitting = hasStats(player1Data, 'hitting');
  const p2HasHitting = hasStats(player2Data, 'hitting');

  if (p1HasHitting || p2HasHitting) {
    const gp = compareValues(
      player1Data.hitting.gp || '0',
      player2Data.hitting.gp || '0'
    );
    const ab = compareValues(
      player1Data.hitting.ab || '0',
      player2Data.hitting.ab || '0'
    );
    const avg = compareValues(
      player1Data.hitting.avg || '.000',
      player2Data.hitting.avg || '.000'
    );
    const hr = compareValues(
      player1Data.hitting.hr || '0',
      player2Data.hitting.hr || '0'
    );
    const rbi = compareValues(
      player1Data.hitting.rbi || '0',
      player2Data.hitting.rbi || '0'
    );
    const ops = compareValues(
      player1Data.hitting.ops || '.000',
      player2Data.hitting.ops || '.000'
    );

    // Truncate player names to fit in column headers
    const p1Name = player1Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player1Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player1Data.name;
    const p2Name = player2Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player2Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player2Data.name;

    const hittingText =
      `\`\`\`\n` +
      `     ${p1Name.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${p2Name}\n` +
      `${EMBED_FORMATTING.SEPARATOR_CHAR.repeat(EMBED_FORMATTING.COMPARE_TOTAL_WIDTH)}\n` +
      `GP:  ${gp.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${gp.p2}\n` +
      `AB:  ${ab.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${ab.p2}\n` +
      `AVG: ${avg.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${avg.p2}\n` +
      `HR:  ${hr.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${hr.p2}\n` +
      `RBI: ${rbi.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${rbi.p2}\n` +
      `OPS: ${ops.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${ops.p2}\n` +
      `\`\`\``;

    embed.addFields({
      name: 'Hitting Stats',
      value: hittingText,
      inline: false
    });
  }

  // Pitching comparison
  const p1HasPitching = hasStats(player1Data, 'pitching');
  const p2HasPitching = hasStats(player2Data, 'pitching');

  if (p1HasPitching || p2HasPitching) {
    const gp = compareValues(
      player1Data.pitching.gp || '0',
      player2Data.pitching.gp || '0'
    );
    const ip = compareValues(
      player1Data.pitching.ip || '0',
      player2Data.pitching.ip || '0'
    );
    const w = compareValues(
      player1Data.pitching.w || '0',
      player2Data.pitching.w || '0'
    );
    const l = compareValues(
      player1Data.pitching.l || '0',
      player2Data.pitching.l || '0',
      false // lower is better
    );
    const era = compareValues(
      player1Data.pitching.era || '0.00',
      player2Data.pitching.era || '0.00',
      false // lower is better
    );
    const whip = compareValues(
      player1Data.pitching.whip || '0.00',
      player2Data.pitching.whip || '0.00',
      false // lower is better
    );

    // Truncate player names to fit in column headers
    const p1Name = player1Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player1Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player1Data.name;
    const p2Name = player2Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player2Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player2Data.name;

    const pitchingText =
      `\`\`\`\n` +
      `      ${p1Name.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${p2Name}\n` +
      `${EMBED_FORMATTING.SEPARATOR_CHAR.repeat(EMBED_FORMATTING.COMPARE_TOTAL_WIDTH + 2)}\n` +
      `GP:   ${gp.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${gp.p2}\n` +
      `IP:   ${ip.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${ip.p2}\n` +
      `W:    ${w.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${w.p2}\n` +
      `L:    ${l.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${l.p2}\n` +
      `ERA:  ${era.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${era.p2}\n` +
      `WHIP: ${whip.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${whip.p2}\n` +
      `\`\`\``;

    embed.addFields({
      name: 'Pitching Stats',
      value: pitchingText,
      inline: false
    });
  }

  // Fielding comparison
  const p1HasFielding = hasStats(player1Data, 'fielding');
  const p2HasFielding = hasStats(player2Data, 'fielding');

  if (p1HasFielding || p2HasFielding) {
    const gp = compareValues(
      player1Data.fielding.gp || '0',
      player2Data.fielding.gp || '0'
    );
    const np = compareValues(
      player1Data.fielding.np || '0',
      player2Data.fielding.np || '0'
    );
    const e = compareValues(
      player1Data.fielding.e || '0',
      player2Data.fielding.e || '0',
      false // lower is better
    );
    const sb = compareValues(
      player1Data.fielding.sb || '0',
      player2Data.fielding.sb || '0'
    );

    // Truncate player names to fit in column headers
    const p1Name = player1Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player1Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player1Data.name;
    const p2Name = player2Data.name.length > EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH ?
      player2Data.name.substring(0, EMBED_FORMATTING.MAX_PLAYER_NAME_LENGTH) : player2Data.name;

    const fieldingText =
      `\`\`\`\n` +
      `    ${p1Name.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${p2Name}\n` +
      `${EMBED_FORMATTING.SEPARATOR_CHAR.repeat(EMBED_FORMATTING.COMPARE_TOTAL_WIDTH - 2)}\n` +
      `GP: ${gp.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${gp.p2}\n` +
      `NP: ${np.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${np.p2}\n` +
      `E:  ${e.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${e.p2}\n` +
      `SB: ${sb.p1.padEnd(EMBED_FORMATTING.COMPARE_VALUE_WIDTH)} ${sb.p2}\n` +
      `\`\`\``;

    embed.addFields({
      name: 'Fielding Stats',
      value: fieldingText,
      inline: false
    });
  }

  return embed;
}
