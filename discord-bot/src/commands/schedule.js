import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View league or team schedule (regular season only)')
  .addStringOption(option =>
    option
      .setName('view')
      .setDescription('Select schedule view')
      .setRequired(false)
      .addChoices(
        { name: 'Recent', value: 'recent' },
        { name: 'Current', value: 'current' },
        { name: 'Upcoming', value: 'upcoming' }
      )
  )
  .addIntegerOption(option =>
    option
      .setName('week')
      .setDescription('View a specific week (defaults to current week if none selected)')
      .setRequired(false)
      .setMinValue(1)
  )
  .addStringOption(option =>
    option
      .setName('team')
      .setDescription('Team name (shows full season schedule for team)')
      .setRequired(false)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    // Autocomplete for team parameter - regular season only
    const teams = await sheetsService.getAllTeamNames(false);
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
    const viewValue = interaction.options.getString('view');
    const weekNumber = interaction.options.getInteger('week');
    const teamName = interaction.options.getString('team');

    let filter;
    let displayValue;

    // Priority: team > week > view (default: current)
    if (teamName) {
      // Show full schedule for a specific team
      filter = { type: 'team', teamName: teamName };
      displayValue = teamName;
    } else if (weekNumber) {
      // Show specific week
      filter = { type: 'week', weekNumber: weekNumber };
      displayValue = `Week ${weekNumber}`;
    } else {
      // Use view choice, default to 'current'
      const viewType = viewValue || 'current';
      filter = { type: viewType };
      displayValue = viewType;
    }

    // Regular season only (isPlayoffs = false)
    const games = await sheetsService.getScheduleData(filter, false);

    if (!games || games.length === 0) {
      const errorEmbed = createErrorEmbed('No games found for the selected filter.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createScheduleEmbed(games, filter, displayValue, false);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching schedule:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the schedule. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
