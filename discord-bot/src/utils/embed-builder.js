import { EmbedBuilder } from 'discord.js';
import { STAT_LABELS } from '../config/league-config.js';

const COLORS = {
  PRIMARY: 0x0099FF,
  SUCCESS: 0x00FF00,
  WARNING: 0xFFFF00,
  ERROR: 0xFF0000,
  INFO: 0x00FFFF
};

export function createPlayerStatsEmbed(playerData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${playerData.name}`)
    .setDescription(`**Team:** ${playerData.team}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Helper to pad labels for alignment
  const padLabel = (label, length = 18) => label.padEnd(length, ' ');

  const hasHittingStats = Object.values(playerData.hitting).some(val => val !== '0');
  if (hasHittingStats) {
    const hittingBlock = '```\n' +
      `${padLabel('Games:')} ${playerData.hitting.gp}\n` +
      `${padLabel('At Bats:')} ${playerData.hitting.ab}\n` +
      `${padLabel('Hits:')} ${playerData.hitting.h}\n` +
      `${padLabel('Home Runs:')} ${playerData.hitting.hr}\n` +
      `${padLabel('RBI:')} ${playerData.hitting.rbi}\n` +
      `${padLabel('Walks:')} ${playerData.hitting.bb}\n` +
      `${padLabel('Strikeouts:')} ${playerData.hitting.k}\n` +
      `${padLabel('Total Bases:')} ${playerData.hitting.tb}\n` +
      `${padLabel('ROB:')} ${playerData.hitting.rob}\n` +
      `${padLabel('Double Plays:')} ${playerData.hitting.dp}\n` +
      '---\n' +
      `${padLabel('Batting Avg:')} ${playerData.hitting.avg}\n` +
      `${padLabel('On-Base %:')} ${playerData.hitting.obp}\n` +
      `${padLabel('Slugging %:')} ${playerData.hitting.slg}\n` +
      `${padLabel('OPS:')} ${playerData.hitting.ops}` +
      '\n```';

    embed.addFields({
      name: 'Hitting Stats',
      value: hittingBlock,
      inline: true
    });
  }

  const hasPitchingStats = Object.values(playerData.pitching).some(val => val !== '0');
  if (hasPitchingStats) {
    const pitchingBlock = '```\n' +
      `${padLabel('Games:')} ${playerData.pitching.gp}\n` +
      `${padLabel('Wins:')} ${playerData.pitching.w}\n` +
      `${padLabel('Losses:')} ${playerData.pitching.l}\n` +
      `${padLabel('Saves:')} ${playerData.pitching.sv}\n` +
      `${padLabel('Innings:')} ${playerData.pitching.ip}\n` +
      `${padLabel('Batters Faced:')} ${playerData.pitching.bf}\n` +
      `${padLabel('Hits Allowed:')} ${playerData.pitching.h}\n` +
      `${padLabel('Walks Allowed:')} ${playerData.pitching.bb}\n` +
      `${padLabel('Strikeouts:')} ${playerData.pitching.k}\n` +
      `${padLabel('Home Runs:')} ${playerData.pitching.hr}\n` +
      `${padLabel('Runs Allowed:')} ${playerData.pitching.r}\n` +
      '---\n' +
      `${padLabel('ERA:')} ${playerData.pitching.era}\n` +
      `${padLabel('WHIP:')} ${playerData.pitching.whip}\n` +
      `${padLabel('BAvg Against:')} ${playerData.pitching.baa}` +
      '\n```';

    embed.addFields({
      name: 'Pitching Stats',
      value: pitchingBlock,
      inline: true
    });
  }

  const hasFieldingStats = Object.values(playerData.fielding).some(val => val !== '0');
  if (hasFieldingStats) {
    const fieldingBlock = '```\n' +
      `${padLabel('Games:')} ${playerData.fielding.gp}\n` +
      `${padLabel('Nice Plays:')} ${playerData.fielding.np}\n` +
      `${padLabel('Errors:')} ${playerData.fielding.e}\n` +
      `${padLabel('Stolen Bases:')} ${playerData.fielding.sb}` +
      '\n```';

    embed.addFields({
      name: 'Fielding & Baserunning',
      value: fieldingBlock,
      inline: true
    });
  }

  if (!hasHittingStats && !hasPitchingStats && !hasFieldingStats) {
    embed.setDescription(`${embed.data.description}\n\n*No stats available for this player yet.*`);
  }

  return embed;
}

export function createTeamStatsEmbed(teamData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${teamData.name}`)
    .setDescription(`**General Manager:** ${teamData.captain}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Helper to pad labels for alignment
  const padLabel = (label, length = 22) => label.padEnd(length, ' ');

  // Team Hitting with monospace code block
  if (teamData.hitting) {
    const winPct = (parseInt(teamData.wins) / parseInt(teamData.gp) || 0).toFixed(3);
    const hittingBlock = '```\n' +
      `${padLabel('Record:')} ${teamData.wins}-${teamData.losses} (${winPct})\n` +
      `${padLabel('Runs:')} ${teamData.hitting.runsScored}\n` +
      `${padLabel('Runs/Game:')} ${teamData.hitting.runsPerGame}\n` +
      `${padLabel('At Bats:')} ${teamData.hitting.ab}\n` +
      `${padLabel('Hits:')} ${teamData.hitting.h}\n` +
      `${padLabel('Home Runs:')} ${teamData.hitting.hr}\n` +
      `${padLabel('RBI:')} ${teamData.hitting.rbi}\n` +
      `${padLabel('Total Bases:')} ${teamData.hitting.tb}\n` +
      `${padLabel('Walks:')} ${teamData.hitting.bb}\n` +
      `${padLabel('Strikeouts:')} ${teamData.hitting.k}\n` +
      '---\n' +
      `${padLabel('Batting Avg:')} ${teamData.hitting.avg}\n` +
      `${padLabel('On-Base %:')} ${teamData.hitting.obp}\n` +
      `${padLabel('Slugging %:')} ${teamData.hitting.slg}\n` +
      `${padLabel('OPS:')} ${teamData.hitting.ops}` +
      '\n```';

    embed.addFields({
      name: 'Team Hitting',
      value: hittingBlock,
      inline: true
    });
  }

  // Team Pitching with monospace code block
  if (teamData.pitching) {
    const pitchingBlock = '```\n' +
      `${padLabel('Innings:')} ${teamData.pitching.ip}\n` +
      `${padLabel('Batters Faced:')} ${teamData.pitching.bf}\n` +
      `${padLabel('Hits Allowed:')} ${teamData.pitching.h}\n` +
      `${padLabel('Walks Allowed:')} ${teamData.pitching.bb}\n` +
      `${padLabel('Strikeouts:')} ${teamData.pitching.k}\n` +
      `${padLabel('Home Runs:')} ${teamData.pitching.hr}\n` +
      `${padLabel('Runs Allowed:')} ${teamData.pitching.r}\n` +
      '---\n' +
      `${padLabel('ERA:')} ${teamData.pitching.era}\n` +
      `${padLabel('WHIP:')} ${teamData.pitching.whip}\n` +
      `${padLabel('BAvg Against:')} ${teamData.pitching.baa}` +
      '\n```';

    embed.addFields({
      name: 'Team Pitching',
      value: pitchingBlock,
      inline: true
    });
  }

  // Team Fielding with monospace code block
  if (teamData.fielding) {
    const fieldingBlock = '```\n' +
      `${padLabel('Nice Plays:')} ${teamData.fielding.np}\n` +
      `${padLabel('Nice Plays/Game:')} ${teamData.fielding.npPerGame}\n` +
      `${padLabel('Errors:')} ${teamData.fielding.e}\n` +
      `${padLabel('Stolen Bases:')} ${teamData.fielding.sb}` +
      '\n```';

    embed.addFields({
      name: 'Team Fielding',
      value: fieldingBlock,
      inline: true
    });
  }

  return embed;
}

export function createStandingsEmbed(standings) {
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

export function createRankingsEmbed(statLabel, leaders, format) {
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

export function createRosterEmbed(roster) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${roster.teamName} Roster`)
    .setDescription(`General Manager: ${roster.captain}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  const playerList = roster.players.map((player, index) => `${index + 1}. ${player}`).join('\n');

  embed.addFields({
    name: 'Players',
    value: playerList || 'No players',
    inline: false
  });

  return embed;
}
