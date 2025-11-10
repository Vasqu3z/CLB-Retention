import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('scores')
  .setDescription('View past game scores for completed weeks')
  .addStringOption(option =>
    option
      .setName('week')
      .setDescription('Week number')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    // Get all games to determine which weeks have been completed
    const allGames = await sheetsService.getScheduleData({ type: 'all' });

    // Find unique weeks with completed games
    const completedWeeks = [...new Set(
      allGames
        .filter(game => game.played)
        .map(game => game.week)
    )].sort((a, b) => a - b);

    // Create autocomplete options for completed weeks
    const weekOptions = completedWeeks.map(week => ({
      name: `Week ${week}`,
      value: `week${week}`
    }));

    const filtered = weekOptions
      .filter(opt => opt.name.toLowerCase().includes(focusedValue))
      .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES);

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in scores autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const weekValue = interaction.options.getString('week');

    // Extract week number from value like "week1", "week2", etc.
    const weekNumber = parseInt(weekValue.replace('week', ''));

    // Get all games to check if this week has completed games
    const allGames = await sheetsService.getScheduleData({ type: 'all' });
    const weekGames = allGames.filter(g => g.week === weekNumber);
    const hasCompletedGames = weekGames.some(g => g.played);

    // If this week has no completed games, redirect to /schedule behavior
    if (!hasCompletedGames) {
      const filter = { type: 'week', weekNumber: weekNumber };
      const games = await sheetsService.getScheduleData(filter);

      if (!games || games.length === 0) {
        const errorEmbed = createErrorEmbed(`No games found for Week ${weekNumber}.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = await createScheduleEmbed(games, filter, weekValue);
      await interaction.editReply({ embeds: [embed] });
      sheetsService.refreshCache();
      return;
    }

    // Show scores for this week
    const filter = { type: 'week', weekNumber: weekNumber };
    const games = await sheetsService.getScheduleData(filter);

    if (!games || games.length === 0) {
      const errorEmbed = createErrorEmbed(`No games found for Week ${weekNumber}.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createScheduleEmbed(games, filter, weekValue);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching scores:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching scores. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
