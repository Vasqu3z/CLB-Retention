import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createStandingsEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('standings')
  .setDescription('View current league standings');

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const standings = await sheetsService.getStandings();

    if (!standings || standings.length === 0) {
      const errorEmbed = createErrorEmbed('No standings available yet.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createStandingsEmbed(standings);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching standings:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching standings. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
