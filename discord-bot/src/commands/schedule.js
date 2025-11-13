import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View league or team schedule')
  .addStringOption(option =>
    option
      .setName('filter')
      .setDescription('Schedule filter: recent, current, or upcoming')
      .setRequired(false)
      .addChoices(
        { name: 'Recent - Last completed week', value: 'recent' },
        { name: 'Current - This week', value: 'current' },
        { name: 'Upcoming - Next week', value: 'upcoming' }
      )
  )
  .addIntegerOption(option =>
    option
      .setName('week')
      .setDescription('Specific week number')
      .setRequired(false)
      .setMinValue(1)
  )
  .addStringOption(option =>
    option
      .setName('team')
      .setDescription('Team name (shows full season schedule for team)')
      .setRequired(false)
      .setAutocomplete(true)
  )
  .addBooleanOption(option =>
    option
      .setName('postseason')
      .setDescription('Show playoff schedule instead of regular season')
      .setRequired(false)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const isPlayoffs = interaction.options.getBoolean('postseason') || false;

    // Autocomplete for team parameter
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
  } catch (error) {
    console.error('Error in schedule autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const filterValue = interaction.options.getString('filter');
    const weekNumber = interaction.options.getInteger('week');
    const teamName = interaction.options.getString('team');
    const isPlayoffs = interaction.options.getBoolean('postseason') || false;

    let filter;
    let displayValue;

    // Priority: team > week > filter (default: current)
    if (teamName) {
      // Show full schedule for a specific team
      filter = { type: 'team', teamName: teamName };
      displayValue = teamName;
    } else if (weekNumber) {
      // Show specific week
      filter = { type: 'week', weekNumber: weekNumber };
      displayValue = `Week ${weekNumber}`;
    } else {
      // Use filter choice, default to 'current'
      const filterType = filterValue || 'current';
      filter = { type: filterType };
      displayValue = filterType;
    }

    const games = await sheetsService.getScheduleData(filter, isPlayoffs);

    if (!games || games.length === 0) {
      const seasonType = isPlayoffs ? 'playoff' : 'regular season';
      const errorEmbed = createErrorEmbed(`No ${seasonType} games found for the selected filter.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createScheduleEmbed(games, filter, displayValue, isPlayoffs);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching schedule:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the schedule. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
