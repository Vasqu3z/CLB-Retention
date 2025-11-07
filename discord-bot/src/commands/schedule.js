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

    // Week options (weeks 1-20 to cover most leagues)
    const weekOptions = [];
    for (let i = 1; i <= 20; i++) {
      weekOptions.push({
        name: `Week ${i}`,
        value: `week${i}`
      });
    }

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
