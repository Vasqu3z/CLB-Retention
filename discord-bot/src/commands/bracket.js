import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createScheduleEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('bracket')
  .setDescription('View playoff bracket by round')
  .addIntegerOption(option =>
    option
      .setName('round')
      .setDescription('Playoff round (1=Quarterfinals, 2=Semifinals, 3=Championship)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(3)
  );

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const round = interaction.options.getInteger('round');

    // Map round number to round name
    const roundNames = {
      1: 'Quarterfinals',
      2: 'Semifinals',
      3: 'Championship'
    };

    const roundName = roundNames[round];

    if (!roundName) {
      const errorEmbed = createErrorEmbed('Invalid round. Please select 1 (Quarterfinals), 2 (Semifinals), or 3 (Championship).');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Fetch playoff schedule data filtered by round
    const filter = { type: 'round', roundNumber: round };
    const games = await sheetsService.getScheduleData(filter, true); // isPlayoffs = true

    if (!games || games.length === 0) {
      const errorEmbed = createErrorEmbed(`No playoff games found for ${roundName} (Round ${round}).`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Create embed with round name as display value
    const embed = await createScheduleEmbed(games, filter, roundName, true);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching playoff bracket:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching the playoff bracket. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
