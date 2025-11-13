import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('View league or team schedule')
  .addSubcommand(subcommand =>
    subcommand
      .setName('recent')
      .setDescription('Last completed week')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('current')
      .setDescription('This week')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('upcoming')
      .setDescription('Next week')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('week')
      .setDescription('View specific week')
      .addIntegerOption(option =>
        option
          .setName('number')
          .setDescription('Week number')
          .setRequired(true)
          .setMinValue(1)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('team')
      .setDescription('View team schedule')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Team name')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    // Autocomplete for team name
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
    const subcommand = interaction.options.getSubcommand();

    let filter;
    let displayValue;
    let isPlayoffs = false;

    // Handle based on subcommand
    if (subcommand === 'week') {
      const weekNumber = interaction.options.getInteger('number');
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

    } else if (subcommand === 'team') {
      const teamName = interaction.options.getString('name');
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
      filter = { type: subcommand };
      displayValue = subcommand;

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
