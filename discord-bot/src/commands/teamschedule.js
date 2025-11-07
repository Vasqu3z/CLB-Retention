import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('teamschedule')
  .setDescription('View a team\'s full season schedule')
  .addStringOption(option =>
    option
      .setName('team')
      .setDescription('Team name')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    // Get team names (will be filtered to exclude teams without captains)
    const teams = await sheetsService.getAllTeamNames();
    const teamOptions = teams
      .filter(team => team.captain && team.captain.trim() !== '' && team.captain !== 'Unknown') // Filter out teams without captains
      .filter(team => team.name.toLowerCase().includes(focusedValue) || team.captain.toLowerCase().includes(focusedValue))
      .slice(0, DISCORD_LIMITS.AUTOCOMPLETE_MAX_CHOICES)
      .map(team => ({
        name: `${team.name} - ${team.captain}`,
        value: team.name
      }));

    await interaction.respond(teamOptions);
  } catch (error) {
    console.error('Error in teamschedule autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const teamName = interaction.options.getString('team');

    const filter = { type: 'team', teamName: teamName };
    const games = await sheetsService.getScheduleData(filter);

    if (!games || games.length === 0) {
      const errorEmbed = createErrorEmbed(`No games found for ${teamName}.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createScheduleEmbed(games, filter, teamName);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching team schedule:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the team schedule. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
