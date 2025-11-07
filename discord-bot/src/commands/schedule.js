import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View league schedule')
  .addStringOption(option =>
    option
      .setName('filter')
      .setDescription('Schedule filter')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    // Static options
    const staticOptions = [
      { name: 'Recent - Last week\'s completed games', value: 'recent' },
      { name: 'Current - This week\'s schedule', value: 'current' },
      { name: 'Upcoming - Next week\'s schedule', value: 'upcoming' }
    ];

    // Get all games to determine which weeks are unplayed
    const allGames = await sheetsService.getScheduleData({ type: 'all' });

    // Find the current week (last completed week + 1)
    const maxCompletedWeek = Math.max(0, ...allGames.filter(g => g.played).map(g => g.week));
    const currentWeek = maxCompletedWeek + 1;

    // Find all future/unplayed weeks
    const futureWeeks = [...new Set(
      allGames
        .filter(game => !game.played && game.week > maxCompletedWeek)
        .map(game => game.week)
    )].sort((a, b) => a - b);

    // Create autocomplete options for future weeks
    const weekOptions = futureWeeks.map(week => ({
      name: `Week ${week}`,
      value: `week${week}`
    }));

    // Combine and filter
    const allOptions = [...staticOptions, ...weekOptions];
    const filtered = allOptions
      .filter(opt => opt.name.toLowerCase().includes(focusedValue))
      .slice(0, 25);

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in schedule autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const filterValue = interaction.options.getString('filter');

    // Determine filter type
    let filter;
    if (['recent', 'current', 'upcoming'].includes(filterValue)) {
      filter = { type: filterValue };
    } else if (filterValue.startsWith('week')) {
      // Extract week number from value like "week1", "week2", etc.
      const weekNumber = parseInt(filterValue.replace('week', ''));

      // Check if this week has completed games (redirect to /scores behavior)
      const allGames = await sheetsService.getScheduleData({ type: 'all' });
      const weekGames = allGames.filter(g => g.week === weekNumber);
      const allGamesCompleted = weekGames.length > 0 && weekGames.every(g => g.played);

      if (allGamesCompleted) {
        // This is a past week - show scores
        filter = { type: 'week', weekNumber: weekNumber };
        const games = await sheetsService.getScheduleData(filter);

        if (!games || games.length === 0) {
          const errorEmbed = createErrorEmbed(`No games found for Week ${weekNumber}.`);
          await interaction.editReply({ embeds: [errorEmbed] });
          return;
        }

        const embed = await createScheduleEmbed(games, filter, filterValue);
        await interaction.editReply({ embeds: [embed] });
        sheetsService.refreshCache();
        return;
      }

      filter = { type: 'week', weekNumber: weekNumber };
    } else {
      // Unknown filter
      const errorEmbed = createErrorEmbed(`Invalid filter: ${filterValue}`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const games = await sheetsService.getScheduleData(filter);

    if (!games || games.length === 0) {
      const errorEmbed = createErrorEmbed('No games found for the selected filter.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createScheduleEmbed(games, filter, filterValue);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching schedule:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the schedule. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
