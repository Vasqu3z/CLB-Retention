import { SlashCommandBuilder } from 'discord.js';
import sheetsService from '../services/sheets-service.js';
import { createRankingsEmbed, createErrorEmbed } from '../utils/embed-builder.js';

const RANKING_STATS = {
  // Batting
  'obp': { category: 'batting', label: 'On-Base Percentage (OBP)', format: '.000' },
  'hits': { category: 'batting', label: 'Hits', format: 'int' },
  'hr': { category: 'batting', label: 'Home Runs', format: 'int' },
  'rbi': { category: 'batting', label: 'RBI', format: 'int' },
  'slg': { category: 'batting', label: 'Slugging Percentage (SLG)', format: '.000' },
  'ops': { category: 'batting', label: 'OPS', format: '.000' },
  // Pitching
  'ip': { category: 'pitching', label: 'Innings Pitched', format: 'decimal' },
  'wins': { category: 'pitching', label: 'Wins', format: 'int' },
  'losses': { category: 'pitching', label: 'Losses', format: 'int' },
  'saves': { category: 'pitching', label: 'Saves', format: 'int' },
  'era': { category: 'pitching', label: 'ERA', format: '.00' },
  'whip': { category: 'pitching', label: 'WHIP', format: '.00' },
  'baa': { category: 'pitching', label: 'Batting Average Against (BAA)', format: '.000' },
  // Fielding
  'niceplays': { category: 'fielding', label: 'Nice Plays', format: 'int' },
  'errors': { category: 'fielding', label: 'Errors', format: 'int' },
  'stolenbases': { category: 'fielding', label: 'Stolen Bases', format: 'int' }
};

export const data = new SlashCommandBuilder()
  .setName('rankings')
  .setDescription('View top 5 league leaders for a specific stat')
  .addStringOption(option =>
    option
      .setName('stat')
      .setDescription('Stat category')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const choices = Object.entries(RANKING_STATS)
      .filter(([key, value]) =>
        key.includes(focusedValue) || value.label.toLowerCase().includes(focusedValue)
      )
      .slice(0, 25)
      .map(([key, value]) => ({
        name: value.label,
        value: key
      }));

    await interaction.respond(choices);
  } catch (error) {
    console.error('Error in rankings autocomplete:', error);
    await interaction.respond([]);
  }
}

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const stat = interaction.options.getString('stat');
    const statInfo = RANKING_STATS[stat];

    if (!statInfo) {
      const errorEmbed = createErrorEmbed(`Invalid stat: "${stat}"`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const rankings = await sheetsService.getLeagueLeaders(statInfo.category, stat);

    if (!rankings || rankings.length === 0) {
      const errorEmbed = createErrorEmbed(`No data available for ${statInfo.label}`);
      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = await createRankingsEmbed(statInfo.label, rankings, statInfo.format);
    await interaction.editReply({ embeds: [embed] });

    sheetsService.refreshCache();
  } catch (error) {
    console.error('Error fetching rankings:', error);
    const errorEmbed = createErrorEmbed('An error occurred while fetching rankings. Please try again later.');
    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
