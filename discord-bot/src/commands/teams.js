import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createTeamStatsEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('teams')
  .setDescription('Get detailed stats for a specific team')
  .addStringOption(option =>
    option
      .setName('teamname')
      .setDescription('Team name')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addBooleanOption(option =>
    option
      .setName('postseason')
      .setDescription('Show playoff stats instead of regular season')
      .setRequired(false)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const isPlayoffs = interaction.options.getBoolean('postseason') || false;

    const teams = await sheetsService.getAllTeamNames(isPlayoffs);

    const filtered = teams
      .filter(team => team.captain && team.captain.trim() !== '' && team.captain !== 'Unknown') // Filter out teams without captains
      .filter(team => team.name.toLowerCase().includes(focusedValue) || team.captain.toLowerCase().includes(focusedValue))
      .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES)
      .map(team => ({
        name: `${team.name} - ${team.captain}`,
        value: team.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in teams autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const teamName = interaction.options.getString('teamname');
    const isPlayoffs = interaction.options.getBoolean('postseason') || false;
    const teamStats = await sheetsService.getTeamStats(teamName, isPlayoffs);

    if (!teamStats) {
      const seasonType = isPlayoffs ? 'playoff' : 'regular season';
      const errorEmbed = createErrorEmbed(`Team "${teamName}" not found in the ${seasonType} stats.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createTeamStatsEmbed(teamStats, isPlayoffs);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching team stats:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching team stats. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
