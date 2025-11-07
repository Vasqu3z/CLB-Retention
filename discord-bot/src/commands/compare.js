import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createPlayerCompareEmbed, createErrorEmbed } from '../utils/embed-builder.js';

export const data = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare stats between two players')
  .addStringOption(option =>
    option
      .setName('player1')
      .setDescription('First player')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option
      .setName('player2')
      .setDescription('Second player')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const players = await sheetsService.getAllPlayerNames();

    const filtered = players
      .filter(player => player.name.toLowerCase().includes(focusedValue) || player.team.toLowerCase().includes(focusedValue))
      .slice(0, 25)
      .map(player => ({
        name: `${player.name} - ${player.team}`,
        value: player.name
      }));

    await interaction.respond(filtered);
  } catch (error) {
    console.error('Error in compare autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const player1Name = interaction.options.getString('player1');
    const player2Name = interaction.options.getString('player2');

    if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
      const errorEmbed = createErrorEmbed('Please select two different players.');
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const [player1Data, player2Data] = await Promise.all([
      sheetsService.getPlayerStats(player1Name),
      sheetsService.getPlayerStats(player2Name)
    ]);

    if (!player1Data) {
      const errorEmbed = createErrorEmbed(`Player "${player1Name}" not found.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    if (!player2Data) {
      const errorEmbed = createErrorEmbed(`Player "${player2Name}" not found.`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = createPlayerCompareEmbed(player1Data, player2Data);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error comparing players:', error);
    const errorEmbed = createErrorEmbed('An error occurred while comparing players. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
