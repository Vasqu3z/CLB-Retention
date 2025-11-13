import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View league or team schedule')
  .addStringOption(option =>
    option
      .setName('type')
      .setDescription('Schedule type')
      .setRequired(true)
      .addChoices(
        { name: 'Recent - Last completed week', value: 'recent' },
        { name: 'Current - This week', value: 'current' },
        { name: 'Upcoming - Next week', value: 'upcoming' },
        { name: 'Week - View specific week (provide week number)', value: 'week' },
        { name: 'Team - View team schedule (provide team name)', value: 'team' }
      )
  )
  .addIntegerOption(option =>
    option
      .setName('week')
      .setDescription('Week number (only for Week type)')
      .setRequired(false)
      .setMinValue(1)
  )
  .addStringOption(option =>
    option
      .setName('team')
      .setDescription('Team name (only for Team type)')
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
    const scheduleType = interaction.options.getString('type');
    const weekNumber = interaction.options.getInteger('week');
    const teamName = interaction.options.getString('team');

    let filter;
    let displayValue;
    let isPlayoffs = false;

    // Handle based on selected type
    if (scheduleType === 'week') {
      if (!weekNumber) {
        const errorEmbed = createErrorEmbed('Please provide a week number when using the Week option.');
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }
      filter = { type: 'week', weekNumber: weekNumber };
      displayValue = `Week ${weekNumber}`;

      // Check both regular season and playoffs for this week
      let games = await sheetsService.getScheduleData(filter, false);
      if (!games || games.length === 0) {
        games = await sheetsService.getScheduleData(filter, true);
        isPlayoffs = true;
      }

      if (!games || games.length === 0) {
        const errorEmbed = createErrorEmbed(`No games found for Week ${weekNumber}.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = await createScheduleEmbed(games, filter, displayValue, isPlayoffs);
      await interaction.editReply({ embeds: [embed] });

    } else if (scheduleType === 'team') {
      if (!teamName) {
        const errorEmbed = createErrorEmbed('Please provide a team name when using the Team option.');
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }
      filter = { type: 'team', teamName: teamName };
      displayValue = teamName;

      // Check both regular season and playoffs for this team
      let games = await sheetsService.getScheduleData(filter, false);
      if (!games || games.length === 0) {
        games = await sheetsService.getScheduleData(filter, true);
        isPlayoffs = true;
      }

      if (!games || games.length === 0) {
        const errorEmbed = createErrorEmbed(`No games found for ${teamName}.`);
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = await createScheduleEmbed(games, filter, displayValue, isPlayoffs);
      await interaction.editReply({ embeds: [embed] });

    } else {
      // Recent, Current, or Upcoming - automatically check both regular season and playoffs
      filter = { type: scheduleType };
      displayValue = scheduleType;

      // First try regular season
      let games = await sheetsService.getScheduleData(filter, false);

      // If no regular season games, check playoffs
      if (!games || games.length === 0) {
        games = await sheetsService.getScheduleData(filter, true);
        isPlayoffs = true;
      }

      if (!games || games.length === 0) {
        const errorEmbed = createErrorEmbed('No games found for the selected filter.');
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const embed = await createScheduleEmbed(games, filter, displayValue, isPlayoffs);
      await interaction.editReply({ embeds: [embed] });
    }

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching schedule:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the schedule. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
