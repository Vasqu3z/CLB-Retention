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

  const hasHittingStats = Object.values(playerData.hitting).some(val => val !== '0');
  if (hasHittingStats) {
    const hittingStats = [
      `**${STAT_LABELS.HITTING.GP}:** ${playerData.hitting.gp}`,
      `**${STAT_LABELS.HITTING.AB}:** ${playerData.hitting.ab}`,
      `**${STAT_LABELS.HITTING.H}:** ${playerData.hitting.h}`,
      `**${STAT_LABELS.HITTING.HR}:** ${playerData.hitting.hr}`,
      `**${STAT_LABELS.HITTING.RBI}:** ${playerData.hitting.rbi}`,
      `**${STAT_LABELS.HITTING.BB}:** ${playerData.hitting.bb}`,
      `**${STAT_LABELS.HITTING.K}:** ${playerData.hitting.k}`,
      ''
    ];

    const calculatedStats = [
      `**${STAT_LABELS.HITTING.AVG}:** ${playerData.hitting.avg}`,
      `**${STAT_LABELS.HITTING.OBP}:** ${playerData.hitting.obp}`,
      `**${STAT_LABELS.HITTING.SLG}:** ${playerData.hitting.slg}`,
      `**${STAT_LABELS.HITTING.OPS}:** ${playerData.hitting.ops}`
    ];

    const advancedStats = [
      `**${STAT_LABELS.HITTING.TB}:** ${playerData.hitting.tb}`,
      `**${STAT_LABELS.HITTING.ROB}:** ${playerData.hitting.rob}`,
      `**${STAT_LABELS.HITTING.DP}:** ${playerData.hitting.dp}`
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
      `**${STAT_LABELS.PITCHING.GP}:** ${playerData.pitching.gp}`,
      `**${STAT_LABELS.PITCHING.W}:** ${playerData.pitching.w}`,
      `**${STAT_LABELS.PITCHING.L}:** ${playerData.pitching.l}`,
      `**${STAT_LABELS.PITCHING.SV}:** ${playerData.pitching.sv}`,
      `**${STAT_LABELS.PITCHING.IP}:** ${playerData.pitching.ip}`,
      `**${STAT_LABELS.PITCHING.K}:** ${playerData.pitching.k}`,
      ''
    ];

    const pitchingAdvanced = [
      `**${STAT_LABELS.PITCHING.ERA}:** ${playerData.pitching.era}`,
      `**${STAT_LABELS.PITCHING.WHIP}:** ${playerData.pitching.whip}`,
      `**${STAT_LABELS.PITCHING.BAA}:** ${playerData.pitching.baa}`,
      ''
    ];

    const pitchingDetails = [
      `**${STAT_LABELS.PITCHING.BF}:** ${playerData.pitching.bf}`,
      `**${STAT_LABELS.PITCHING.H}:** ${playerData.pitching.h}`,
      `**${STAT_LABELS.PITCHING.BB}:** ${playerData.pitching.bb}`,
      `**${STAT_LABELS.PITCHING.HR}:** ${playerData.pitching.hr}`,
      `**${STAT_LABELS.PITCHING.R}:** ${playerData.pitching.r}`
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
      `**${STAT_LABELS.FIELDING.GP}:** ${playerData.fielding.gp}`,
      `**${STAT_LABELS.FIELDING.NP}:** ${playerData.fielding.np}`,
      `**${STAT_LABELS.FIELDING.E}:** ${playerData.fielding.e}`,
      `**${STAT_LABELS.FIELDING.SB}:** ${playerData.fielding.sb}`
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

export function createTeamStatsEmbed(teamData) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`${teamData.name}`)
    .setDescription(`**General Manager:** ${teamData.captain}\n**Record:** ${teamData.wins}-${teamData.losses} (${(parseInt(teamData.wins) / parseInt(teamData.gp) || 0).toFixed(3)})`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  // Team Hitting - 3 columns like player stats with full stat labels
  if (teamData.hitting) {
    const countingStats = [
      `**Runs:** ${teamData.hitting.runsScored}`,
      `**Runs/Game:** ${teamData.hitting.runsPerGame}`,
      `**${STAT_LABELS.HITTING.AB}:** ${teamData.hitting.ab}`,
      `**${STAT_LABELS.HITTING.H}:** ${teamData.hitting.h}`,
      `**${STAT_LABELS.HITTING.HR}:** ${teamData.hitting.hr}`,
      `**${STAT_LABELS.HITTING.RBI}:** ${teamData.hitting.rbi}`,
      ''
    ];

    const rateStats = [
      `**${STAT_LABELS.HITTING.AVG}:** ${teamData.hitting.avg}`,
      `**${STAT_LABELS.HITTING.OBP}:** ${teamData.hitting.obp}`,
      `**${STAT_LABELS.HITTING.SLG}:** ${teamData.hitting.slg}`,
      `**${STAT_LABELS.HITTING.OPS}:** ${teamData.hitting.ops}`
    ];

    const advancedStats = [
      `**${STAT_LABELS.HITTING.BB}:** ${teamData.hitting.bb}`,
      `**${STAT_LABELS.HITTING.K}:** ${teamData.hitting.k}`,
      `**${STAT_LABELS.HITTING.TB}:** ${teamData.hitting.tb}`
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

  // Team Pitching - 3 columns like player stats with full stat labels
  if (teamData.pitching) {
    const pitchingStats = [
      `**${STAT_LABELS.PITCHING.IP}:** ${teamData.pitching.ip}`,
      `**${STAT_LABELS.PITCHING.BF}:** ${teamData.pitching.bf}`,
      `**${STAT_LABELS.PITCHING.K}:** ${teamData.pitching.k}`,
      `**${STAT_LABELS.PITCHING.BB}:** ${teamData.pitching.bb}`,
      `**${STAT_LABELS.PITCHING.H}:** ${teamData.pitching.h}`,
      ''
    ];

    const rateStats = [
      `**${STAT_LABELS.PITCHING.ERA}:** ${teamData.pitching.era}`,
      `**${STAT_LABELS.PITCHING.WHIP}:** ${teamData.pitching.whip}`,
      `**${STAT_LABELS.PITCHING.BAA}:** ${teamData.pitching.baa}`
    ];

    const detailStats = [
      `**${STAT_LABELS.PITCHING.HR}:** ${teamData.pitching.hr}`,
      `**${STAT_LABELS.PITCHING.R}:** ${teamData.pitching.r}`
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

  // Team Fielding - match player stats format (one stat per line)
  if (teamData.fielding) {
    const fieldingStats = [
      `**${STAT_LABELS.FIELDING.NP}:** ${teamData.fielding.np}`,
      `**Nice Plays/Game:** ${teamData.fielding.npPerGame}`,
      `**${STAT_LABELS.FIELDING.E}:** ${teamData.fielding.e}`,
      `**${STAT_LABELS.FIELDING.SB}:** ${teamData.fielding.sb}`
    ].join('\n');

    embed.addFields({
      name: 'Team Fielding & Baserunning',
      value: fieldingStats,
      inline: false
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
