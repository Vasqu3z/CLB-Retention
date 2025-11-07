import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createPlayerStatsEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('playerstats')
  .setDescription('Get detailed stats for a specific player')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('Player name')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const players = await sheetsService.getAllPlayerNames();

    const filtered = players
      .filter(player => player.name.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map(player => ({
        name: `${player.name} (${player.team})`,
        value: player.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in playerstats autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const playerName = interaction.options.getString('name');
    const playerStats = await sheetsService.getPlayerStats(playerName);

    if (!playerStats) {
      const errorEmbed = createErrorEmbed(`Player "${playerName}" not found in the league.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = createPlayerStatsEmbed(playerStats);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching player stats. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
