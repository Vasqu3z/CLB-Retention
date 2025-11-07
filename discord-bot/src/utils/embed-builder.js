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

export async function createPlayerStatsEmbed(playerData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${playerData.name}`)
    .setDescription(`**Team:** ${playerData.team}`)
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
      `Games: **${playerData.hitting.gp}**`,
      `At Bats: **${playerData.hitting.ab}**`,
      `Hits: **${playerData.hitting.h}**`,
      `Home Runs: **${playerData.hitting.hr}**`,
      `RBI: **${playerData.hitting.rbi}**`,
      `Walks: **${playerData.hitting.bb}**`,
      `Strikeouts: **${playerData.hitting.k}**`,
      ''
    ];

    const calculatedStats = [
      `Batting Avg: **${playerData.hitting.avg}**`,
      `On-Base %: **${playerData.hitting.obp}**`,
      `Slugging %: **${playerData.hitting.slg}**`,
      `OPS: **${playerData.hitting.ops}**`
    ];

    const advancedStats = [
      `Total Bases: **${playerData.hitting.tb}**`,
      `ROB: **${playerData.hitting.rob}**`,
      `Double Plays: **${playerData.hitting.dp}**`
    ];

    embed.addFields(
      {
        name: 'Hitting Stats',
        value: hittingStats.join('\n'),
        inline: true
      },
      {
        name: 'Rate Stats',
        value: calculatedStats.join('\n'),
        inline: true
      },
      {
        name: 'Advanced',
        value: advancedStats.join('\n'),
        inline: true
      }
    );
  }

  const hasPitchingStats = Object.values(playerData.pitching).some(val => val !== '0');
  if (hasPitchingStats) {
    const pitchingStats = [
      `Games: **${playerData.pitching.gp}**`,
      `Wins: **${playerData.pitching.w}**`,
      `Losses: **${playerData.pitching.l}**`,
      `Saves: **${playerData.pitching.sv}**`,
      `Innings: **${playerData.pitching.ip}**`,
      `Strikeouts: **${playerData.pitching.k}**`,
      ''
    ];

    const pitchingAdvanced = [
      `ERA: **${playerData.pitching.era}**`,
      `WHIP: **${playerData.pitching.whip}**`,
      `BAvg Against: **${playerData.pitching.baa}**`,
      ''
    ];

    const pitchingDetails = [
      `Batters Faced: **${playerData.pitching.bf}**`,
      `Hits Allowed: **${playerData.pitching.h}**`,
      `Walks Allowed: **${playerData.pitching.bb}**`,
      `Home Runs: **${playerData.pitching.hr}**`,
      `Runs Allowed: **${playerData.pitching.r}**`
    ];

    embed.addFields(
      {
        name: 'Pitching Stats',
        value: pitchingStats.join('\n'),
        inline: true
      },
      {
        name: 'Rate Stats',
        value: pitchingAdvanced.join('\n'),
        inline: true
      },
      {
        name: 'Details',
        value: pitchingDetails.join('\n'),
        inline: true
      }
    );
  }

  const hasFieldingStats = Object.values(playerData.fielding).some(val => val !== '0');
  if (hasFieldingStats) {
    const fieldingStats = [
      `Games: **${playerData.fielding.gp}**`,
      `Nice Plays: **${playerData.fielding.np}**`,
      `Errors: **${playerData.fielding.e}**`,
      `Stolen Bases: **${playerData.fielding.sb}**`
    ].join('\n');

    embed.addFields({
      name: 'Fielding & Baserunning',
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
    .setDescription(`**General Manager:** ${teamData.captain}\n**Record:** ${teamData.wins}-${teamData.losses} (${(parseInt(teamData.wins) / parseInt(teamData.gp) || 0).toFixed(3)})`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Add team icon thumbnail
  const teamImageUrl = await sheetsService.getImageUrl(teamData.name, 'team');
  if (teamImageUrl) {
    embed.setThumbnail(teamImageUrl);
  }

  // Team Hitting - 3 columns with bold values
  if (teamData.hitting) {
    const countingStats = [
      `Runs: **${teamData.hitting.runsScored}**`,
      `Runs/Game: **${teamData.hitting.runsPerGame}**`,
      `At Bats: **${teamData.hitting.ab}**`,
      `Hits: **${teamData.hitting.h}**`,
      `Home Runs: **${teamData.hitting.hr}**`,
      `RBI: **${teamData.hitting.rbi}**`,
      ''
    ];

    const rateStats = [
      `Batting Avg: **${teamData.hitting.avg}**`,
      `On-Base %: **${teamData.hitting.obp}**`,
      `Slugging %: **${teamData.hitting.slg}**`,
      `OPS: **${teamData.hitting.ops}**`
    ];

    const advancedStats = [
      `Walks: **${teamData.hitting.bb}**`,
      `Strikeouts: **${teamData.hitting.k}**`,
      `Total Bases: **${teamData.hitting.tb}**`
    ];

    embed.addFields(
      {
        name: 'Team Hitting',
        value: countingStats.join('\n'),
        inline: true
      },
      {
        name: 'Rate Stats',
        value: rateStats.join('\n'),
        inline: true
      },
      {
        name: 'Advanced',
        value: advancedStats.join('\n'),
        inline: true
      }
    );
  }

  // Team Pitching - 3 columns with bold values
  if (teamData.pitching) {
    const pitchingStats = [
      `Innings: **${teamData.pitching.ip}**`,
      `Batters Faced: **${teamData.pitching.bf}**`,
      `Strikeouts: **${teamData.pitching.k}**`,
      `Walks Allowed: **${teamData.pitching.bb}**`,
      `Hits Allowed: **${teamData.pitching.h}**`,
      ''
    ];

    const rateStats = [
      `ERA: **${teamData.pitching.era}**`,
      `WHIP: **${teamData.pitching.whip}**`,
      `BAvg Against: **${teamData.pitching.baa}**`
    ];

    const detailStats = [
      `Home Runs: **${teamData.pitching.hr}**`,
      `Runs Allowed: **${teamData.pitching.r}**`
    ];

    embed.addFields(
      {
        name: 'Team Pitching',
        value: pitchingStats.join('\n'),
        inline: true
      },
      {
        name: 'Rate Stats',
        value: rateStats.join('\n'),
        inline: true
      },
      {
        name: 'Details',
        value: detailStats.join('\n'),
        inline: true
      }
    );
  }

  // Team Fielding with bold values
  if (teamData.fielding) {
    const fieldingStats = [
      `Nice Plays: **${teamData.fielding.np}**`,
      `Nice Plays/Game: **${teamData.fielding.npPerGame}**`,
      `Errors: **${teamData.fielding.e}**`,
      `Stolen Bases: **${teamData.fielding.sb}**`
    ].join('\n');

    embed.addFields({
      name: 'Team Fielding & Baserunning',
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

  // Add league logo thumbnail
  const leagueImageUrl = await sheetsService.getImageUrl('League', 'league');
  if (leagueImageUrl) {
    embed.setThumbnail(leagueImageUrl);
  }

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

  // Add league logo thumbnail
  const leagueImageUrl = await sheetsService.getImageUrl('League', 'league');
  if (leagueImageUrl) {
    embed.setThumbnail(leagueImageUrl);
  }

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

          const winner = parseInt(team1Score) > parseInt(team2Score) ? team1Name : team2Name;

          if (filter.type === 'team') {
            // Show opponent and result
            const opponent = game.homeTeam.toLowerCase().includes(filterValue.toLowerCase()) ? game.awayTeam : game.homeTeam;
            const isHome = game.homeTeam.toLowerCase().includes(filterValue.toLowerCase());
            const resultLabel = winner.toLowerCase().includes(filterValue.toLowerCase()) ? '**W**' : '**L**';
            gameText = `${isHome ? 'vs' : '@'} ${opponent} (${resultLabel} ${team1Score}-${team2Score})`;
          } else {
            // Show full matchup
            gameText = `${game.homeTeam} vs ${game.awayTeam} (${team1Score}-${team2Score})`;
          }

          // Add box score link if available
          if (game.boxScoreUrl) {
            gameText += ` [Box Score](${game.boxScoreUrl})`;
          }
        } else {
          // Fallback if parsing fails
          gameText = `${game.homeTeam} vs ${game.awayTeam} (Completed)`;

          // Add box score link if available
          if (game.boxScoreUrl) {
            gameText += ` [Box Score](${game.boxScoreUrl})`;
          }
        }
      } else {
        // Upcoming game
        if (filter.type === 'team') {
          const opponent = game.homeTeam.toLowerCase().includes(filterValue.toLowerCase()) ? game.awayTeam : game.homeTeam;
          const isHome = game.homeTeam.toLowerCase().includes(filterValue.toLowerCase());
          gameText = `${isHome ? 'vs' : '@'} ${opponent}`;
        } else {
          gameText = `${game.homeTeam} vs ${game.awayTeam}`;
        }
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
