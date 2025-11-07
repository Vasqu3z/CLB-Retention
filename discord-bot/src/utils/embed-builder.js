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
    .setTitle(`📊 ${playerData.name}`)
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
        name: '⚾ Hitting Stats',
        value: hittingStats.join('\n'),
        inline: true
      },
      {
        name: '📈 Rate Stats',
        value: calculatedStats.join('\n'),
        inline: true
      },
      {
        name: '🎯 Advanced',
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
        name: '🥎 Pitching Stats',
        value: pitchingStats.join('\n'),
        inline: true
      },
      {
        name: '📊 Rate Stats',
        value: pitchingAdvanced.join('\n'),
        inline: true
      },
      {
        name: '🔍 Details',
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
      name: '🧤 Fielding & Baserunning',
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
    .setTitle(`🏆 ${teamData.name}`)
    .setDescription(`**Captain:** ${teamData.captain}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  const record = [
    `**Games Played:** ${teamData.gp}`,
    `**Wins:** ${teamData.wins}`,
    `**Losses:** ${teamData.losses}`,
    `**Win %:** ${(parseInt(teamData.wins) / parseInt(teamData.gp) || 0).toFixed(3)}`
  ].join('\n');

  embed.addFields({
    name: '📋 Record',
    value: record,
    inline: false
  });

  // Team Hitting with rate stats
  if (teamData.hitting) {
    const countingStats = [
      `**R:** ${teamData.hitting.runsScored} (**R/G:** ${teamData.hitting.runsPerGame})`,
      `**AB:** ${teamData.hitting.ab}  |  **H:** ${teamData.hitting.h}  |  **HR:** ${teamData.hitting.hr}`,
      `**RBI:** ${teamData.hitting.rbi}  |  **BB:** ${teamData.hitting.bb}  |  **K:** ${teamData.hitting.k}`,
      ''
    ];

    const rateStats = [
      `**AVG:** ${teamData.hitting.avg}`,
      `**OBP:** ${teamData.hitting.obp}`,
      `**SLG:** ${teamData.hitting.slg}`,
      `**OPS:** ${teamData.hitting.ops}`
    ];

    embed.addFields(
      {
        name: '⚾ Team Hitting',
        value: countingStats.join('\n'),
        inline: true
      },
      {
        name: '📊 Rate Stats',
        value: rateStats.join('\n'),
        inline: true
      }
    );
  }

  // Team Pitching with rate stats
  if (teamData.pitching) {
    const countingStats = [
      `**IP:** ${teamData.pitching.ip}  |  **BF:** ${teamData.pitching.bf}`,
      `**H:** ${teamData.pitching.h}  |  **HR:** ${teamData.pitching.hr}`,
      `**R:** ${teamData.pitching.r}  |  **BB:** ${teamData.pitching.bb}  |  **K:** ${teamData.pitching.k}`,
      ''
    ];

    const rateStats = [
      `**ERA:** ${teamData.pitching.era}`,
      `**BAA:** ${teamData.pitching.baa}`,
      `**WHIP:** ${teamData.pitching.whip}`
    ];

    embed.addFields(
      {
        name: '🥎 Team Pitching',
        value: countingStats.join('\n'),
        inline: true
      },
      {
        name: '📈 Rate Stats',
        value: rateStats.join('\n'),
        inline: true
      }
    );
  }

  // Team Fielding with rate stats
  if (teamData.fielding) {
    const fieldingStats = [
      `**Nice Plays:** ${teamData.fielding.np} (**NP/G:** ${teamData.fielding.npPerGame})`,
      `**Errors:** ${teamData.fielding.e}`,
      `**Stolen Bases:** ${teamData.fielding.sb}`
    ].join('\n');

    embed.addFields({
      name: '🧤 Team Fielding & Baserunning',
      value: fieldingStats,
      inline: false
    });
  }

  return embed;
}

export function createStandingsEmbed(standings) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('🏆 League Standings')
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  const standingsText = standings
    .map(team => {
      const rankEmoji = team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : `${team.rank}.`;
      return `${rankEmoji} **${team.team}** - ${team.wins}-${team.losses} (${team.winPct}) | GB: ${team.gamesBack} | RD: ${team.runDiff}`;
    })
    .join('\n');

  embed.setDescription(standingsText || 'No standings available yet.');

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
    .setTitle(`🏅 League Leaders - ${statLabel}`)
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

  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  const leaderText = leaders
    .map((leader, index) => {
      const emoji = rankEmojis[index] || `${index + 1}.`;
      const formattedValue = formatValue(leader.value, format);
      return `${emoji} **${leader.name}** (${leader.team}) - ${formattedValue}`;
    })
    .join('\n');

  embed.setDescription(leaderText);

  return embed;
}

export function createRosterEmbed(roster) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle(`👥 ${roster.teamName} Roster`)
    .setDescription(`**Captain:** ${roster.captain}`)
    .setTimestamp()
    .setFooter({ text: 'CLB League Hub' });

  const playerList = roster.players.map((player, index) => `${index + 1}. ${player}`).join('\n');

  embed.addFields({
    name: `Players (${roster.players.length})`,
    value: playerList || 'No players',
    inline: false
  });

  return embed;
}
