import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createTeamStatsEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('teamstats')
  .setDescription('Get detailed stats for a specific team')
  .addStringOption(option =>
    option
      .setName('teamname')
      .setDescription('Team name')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const teams = await sheetsService.getAllTeamNames();

    const filtered = teams
      .filter(team => team.captain && team.captain.trim() !== '') // Filter out teams without captains
      .filter(team => team.name.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map(team => ({
        name: `${team.name} (Captain: ${team.captain})`,
        value: team.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in teamstats autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const teamName = interaction.options.getString('teamname');
    const teamStats = await sheetsService.getTeamStats(teamName);

    if (!teamStats) {
      const errorEmbed = createErrorEmbed(`Team "${teamName}" not found in the league.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createTeamStatsEmbed(teamStats);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching team stats:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching team stats. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
