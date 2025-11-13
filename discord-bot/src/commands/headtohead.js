import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createHeadToHeadEmbed, createErrorEmbed } from '../utils/embed-builder.js';
import { DISCORD_LIMITS } from '../config/league-config.js';

export const data = new SlashCommandBuilder()
  .setName('headtohead')
  .setDescription('View head-to-head matchup history between two teams')
  .addStringOption(option =>
    option
      .setName('team1')
      .setDescription('First team')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option
      .setName('team2')
      .setDescription('Second team')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option
      .setName('season')
      .setDescription('Choose season type')
      .setRequired(true)
      .addChoices(
        { name: 'Regular Season', value: 'regular' },
        { name: 'Postseason', value: 'postseason' }
      )
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const season = interaction.options.getString('season');
    const isPlayoffs = season === 'postseason';

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
    console.error('Error in headtohead autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const team1Name = interaction.options.getString('team1');
    const team2Name = interaction.options.getString('team2');
    const season = interaction.options.getString('season');
    const isPlayoffs = season === 'postseason';

    if (team1Name.toLowerCase() === team2Name.toLowerCase()) {
      const errorEmbed = createErrorEmbed('Please select two different teams.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const matchupData = await sheetsService.getHeadToHeadData(team1Name, team2Name, isPlayoffs);

    if (!matchupData || matchupData.games.length === 0) {
      const seasonType = isPlayoffs ? 'playoff' : 'regular season';
      const errorEmbed = createErrorEmbed(`No ${seasonType} games found between ${team1Name} and ${team2Name}.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createHeadToHeadEmbed(matchupData, isPlayoffs);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching head-to-head:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching head-to-head data. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
