import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createPlayerCompareEmbed, createTeamCompareEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare stats between two players or teams')
  .addSubcommand(subcommand =>
    subcommand
      .setName('player')
      .setDescription('Compare two players')
      .addStringOption(option =>
        option
          .setName('name1')
          .setDescription('First player name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('name2')
          .setDescription('Second player name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('season')
          .setDescription('Choose season type')
          .setRequired(true)
          .addChoices(
            { name: 'Regular Season', value: 'regular' },
            { name: 'Postseason', value: 'postseason' }
          )
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('team')
      .setDescription('Compare two teams')
      .addStringOption(option =>
        option
          .setName('name1')
          .setDescription('First team name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('name2')
          .setDescription('Second team name')
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName('season')
          .setDescription('Choose season type')
          .setRequired(true)
          .addChoices(
            { name: 'Regular Season', value: 'regular' },
            { name: 'Postseason', value: 'postseason' }
          )
      )
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const subcommand = interaction.options.getSubcommand();
    const isTeam = subcommand === 'team';
    const season = interaction.options.getString('season');
    const isPlayoffs = season === 'postseason';

    if (isTeam) {
      // Autocomplete for teams
      const teams = await sheetsService.getAllTeamNames(isPlayoffs);
      const filtered = teams
        .filter(team => team.captain && team.captain.trim() !== '' && team.captain !== 'Unknown')
        .filter(team => team.name.toLowerCase().includes(focusedValue) || team.captain.toLowerCase().includes(focusedValue))
        .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES)
        .map(team => ({
          name: `${team.name} - ${team.captain}`,
          value: team.name
        }));
      await interaction.respond(filtered);
    } else {
      // Autocomplete for players
      const players = await sheetsService.getAllPlayerNames(isPlayoffs);
      const filtered = players
        .filter(player => player.name.toLowerCase().includes(focusedValue) || player.team.toLowerCase().includes(focusedValue))
        .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES)
        .map(player => ({
          name: `${player.name} - ${player.team}`,
          value: player.name
        }));
      await interaction.respond(filtered);
    }
  } catch (error) {
    console.error('Error in compare autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const name1 = interaction.options.getString('name1');
    const name2 = interaction.options.getString('name2');
    const subcommand = interaction.options.getSubcommand();
    const isTeam = subcommand === 'team';
    const season = interaction.options.getString('season');
    const isPlayoffs = season === 'postseason';

    if (name1.toLowerCase() === name2.toLowerCase()) {
      const entityType = isTeam ? 'teams' : 'players';
      const errorEmbed = createErrorEmbed(`Please select two different ${entityType}.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (isTeam) {
      // Compare teams
      const [team1Data, team2Data] = await Promise.all([
        sheetsService.getTeamStats(name1, isPlayoffs),
        sheetsService.getTeamStats(name2, isPlayoffs)
      ]);

      if (!team1Data) {
        const errorEmbed = createErrorEmbed(`Team "${name1}" not found.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      if (!team2Data) {
        const errorEmbed = createErrorEmbed(`Team "${name2}" not found.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = createTeamCompareEmbed(team1Data, team2Data, isPlayoffs);
      await interaction.editReply({ embeds: [embed] });
    } else {
      // Compare players
      const [player1Data, player2Data] = await Promise.all([
        sheetsService.getPlayerStats(name1, isPlayoffs),
        sheetsService.getPlayerStats(name2, isPlayoffs)
      ]);

      if (!player1Data) {
        const errorEmbed = createErrorEmbed(`Player "${name1}" not found.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      if (!player2Data) {
        const errorEmbed = createErrorEmbed(`Player "${name2}" not found.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = createPlayerCompareEmbed(player1Data, player2Data, isPlayoffs);
      await interaction.editReply({ embeds: [embed] });
    }

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error in compare command:', error);
    const errorEmbed = createErrorEmbed('An error occurred while comparing. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
