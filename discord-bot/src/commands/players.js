import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createPlayerStatsEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('players')
  .setDescription('Get detailed stats for a specific player')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('Player name')
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

    const players = await sheetsService.getAllPlayerNames(isPlayoffs);

    const filtered = players
      .filter(player => player.name.toLowerCase().includes(focusedValue))
      .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES)
      .map(player => ({
        name: `${player.name} (${player.team})`,
        value: player.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in players autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const playerName = interaction.options.getString('name');
    const isPlayoffs = interaction.options.getBoolean('postseason') || false;
    const playerStats = await sheetsService.getPlayerStats(playerName, isPlayoffs);

    if (!playerStats) {
      const seasonType = isPlayoffs ? 'playoff' : 'regular season';
      const errorEmbed = createErrorEmbed(`Player "${playerName}" not found in the ${seasonType} stats.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createPlayerStatsEmbed(playerStats, isPlayoffs);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching player stats. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
