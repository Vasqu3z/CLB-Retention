import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createRosterEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('roster')
  .setDescription('View the roster for a specific team')
  .addStringOption(option =>
    option
      .setName('teamname')
      .setDescription('Team name')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const teams = await sheetsService.getAllTeamNames();

    const filtered = teams
      .filter(team => team.name.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map(team => ({
        name: `${team.name} (Captain: ${team.captain})`,
        value: team.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in roster autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const teamName = interaction.options.getString('teamname');
    const roster = await sheetsService.getTeamRoster(teamName);

    if (!roster) {
      const errorEmbed = createErrorEmbed(`Team "${teamName}" not found in the league.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (roster.players.length === 0) {
      const errorEmbed = createErrorEmbed(`No players found for team "${teamName}".`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = createRosterEmbed(roster);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching roster:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the roster. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
