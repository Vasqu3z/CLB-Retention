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

    // Get team names for team-specific schedules
    const teams = await sheetsService.getAllTeamNames();
    const teamOptions = teams.map(team => ({
      name: `${team.name} - Team schedule`,
      value: team.name
    }));

    // Combine and filter
    const allOptions = [...staticOptions, ...teamOptions];
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
    } else {
      // It's a team name
      filter = { type: 'team', teamName: filterValue };
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
