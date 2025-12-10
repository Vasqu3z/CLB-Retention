/**
 * Player Card Generator - Main Entry Point
 * Generates radar chart player cards for Season 2 Draft
 *
 * Usage:
 *   npx tsx scripts/generate-player-cards/index.ts
 *
 * Options:
 *   --player "Name"   Generate card for a specific player only
 *   --limit N         Limit to first N players
 *   --output dir      Custom output directory (default: scripts/generate-player-cards/output)
 */

import * as path from 'path';
import { getPlayersForCardGeneration, loadLeagueLogo } from './fetchData';
import { batchGeneratePlayerCards } from './generateCard';

// Parse command line arguments
function parseArgs(): { player?: string; limit?: number; output?: string } {
  const args: { player?: string; limit?: number; output?: string } = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--player' && process.argv[i + 1]) {
      args.player = process.argv[++i];
    } else if (arg === '--limit' && process.argv[i + 1]) {
      args.limit = parseInt(process.argv[++i], 10);
    } else if (arg === '--output' && process.argv[i + 1]) {
      args.output = process.argv[++i];
    }
  }

  return args;
}

async function main() {
  console.log('🎴 Player Card Generator - Season 2 Draft\n');

  const args = parseArgs();
  const outputDir = args.output || path.join(__dirname, 'output');

  try {
    // Load league logo
    console.log('Loading league logo...');
    const leagueLogoBase64 = loadLeagueLogo();
    if (leagueLogoBase64) {
      console.log('✓ League logo loaded\n');
    } else {
      console.log('⚠ League logo not found, continuing without it\n');
    }

    // Fetch player data
    console.log('Fetching player data from Google Sheets...');
    let players = await getPlayersForCardGeneration();

    // Filter by player name if specified
    if (args.player) {
      const searchName = args.player.toLowerCase();
      players = players.filter((p) =>
        p.name.toLowerCase().includes(searchName)
      );

      if (players.length === 0) {
        console.error(`No player found matching: ${args.player}`);
        process.exit(1);
      }

      console.log(`Filtered to ${players.length} player(s) matching "${args.player}"\n`);
    }

    // Apply limit if specified
    if (args.limit && args.limit > 0) {
      players = players.slice(0, args.limit);
      console.log(`Limited to first ${args.limit} players\n`);
    }

    if (players.length === 0) {
      console.log('No players to process.');
      return;
    }

    console.log(`\nGenerating ${players.length} player card(s)...\n`);

    // Generate cards
    const startTime = Date.now();
    const { success, failed } = await batchGeneratePlayerCards(
      players,
      outputDir,
      leagueLogoBase64,
      (current, total, name) => {
        const percent = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
        process.stdout.write(`\r[${bar}] ${percent}% - ${name.padEnd(20)}`);
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n\n✅ Generation complete in ${elapsed}s`);
    console.log(`   Output directory: ${outputDir}`);
    console.log(`   Successful: ${success.length}`);

    if (failed.length > 0) {
      console.log(`   Failed: ${failed.length}`);
      console.log('\nFailed players:');
      for (const { name, error } of failed) {
        console.log(`   - ${name}: ${error}`);
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
