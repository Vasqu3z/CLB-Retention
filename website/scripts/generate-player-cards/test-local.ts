/**
 * Local Test Script - Test card generation with mock data
 * Run with: npx tsx scripts/generate-player-cards/test-local.ts
 */

import * as path from 'path';
import { batchGeneratePlayerCards } from './generateCard';
import { loadLeagueLogo } from './fetchData';
import type { PlayerCardInput } from './fetchData';

// Mock player data for testing
const mockPlayers: PlayerCardInput[] = [
  {
    name: 'Mario',
    imageUrl: '',
    attributes: {
      name: 'Mario',
      characterClass: 'Balanced',
      captain: 'Yes',
      mii: 'No',
      miiColor: '',
      armSide: 'R',
      battingSide: 'R',
      weight: 50,
      ability: 'None',
      pitchingOverall: 6,
      battingOverall: 6,
      fieldingOverall: 6,
      speedOverall: 6,
      starSwing: 'Fireball',
      hitCurve: 50,
      hittingTrajectory: 'T3',
      slapHitContact: 65,
      chargeHitContact: 60,
      slapHitPower: 55,
      chargeHitPower: 70,
      speed: 90,
      bunting: 50,
      fielding: 60,
      throwingSpeed: 65,
      preCharge: 'No',
      starPitch: 'Fireball',
      fastballSpeed: 130,
      curveballSpeed: 90,
      curve: 60,
      stamina: 55,
    },
  },
  {
    name: 'Bowser',
    imageUrl: '',
    attributes: {
      name: 'Bowser',
      characterClass: 'Power',
      captain: 'Yes',
      mii: 'No',
      miiColor: '',
      armSide: 'R',
      battingSide: 'R',
      weight: 99,
      ability: 'Laser Beam',
      pitchingOverall: 8,
      battingOverall: 8,
      fieldingOverall: 4,
      speedOverall: 3,
      starSwing: 'Killer Ball',
      hitCurve: 30,
      hittingTrajectory: 'T1',
      slapHitContact: 40,
      chargeHitContact: 35,
      slapHitPower: 75,
      chargeHitPower: 94,
      speed: 45,
      bunting: 20,
      fielding: 35,
      throwingSpeed: 85,
      preCharge: 'No',
      starPitch: 'Killer Ball',
      fastballSpeed: 160,
      curveballSpeed: 110,
      curve: 80,
      stamina: 70,
    },
  },
  {
    name: 'Peach',
    imageUrl: '',
    attributes: {
      name: 'Peach',
      characterClass: 'Technique',
      captain: 'Yes',
      mii: 'No',
      miiColor: '',
      armSide: 'R',
      battingSide: 'R',
      weight: 40,
      ability: 'Super Jump',
      pitchingOverall: 5,
      battingOverall: 5,
      fieldingOverall: 7,
      speedOverall: 5,
      starSwing: 'Heart',
      hitCurve: 70,
      hittingTrajectory: 'T5',
      slapHitContact: 70,
      chargeHitContact: 75,
      slapHitPower: 45,
      chargeHitPower: 50,
      speed: 70,
      bunting: 65,
      fielding: 70,
      throwingSpeed: 55,
      preCharge: 'No',
      starPitch: 'Heart',
      fastballSpeed: 110,
      curveballSpeed: 80,
      curve: 70,
      stamina: 40,
    },
  },
  {
    name: 'Yoshi',
    imageUrl: '',
    attributes: {
      name: 'Yoshi',
      characterClass: 'Speed',
      captain: 'Yes',
      mii: 'No',
      miiColor: '',
      armSide: 'R',
      battingSide: 'L',
      weight: 35,
      ability: 'Super Jump',
      pitchingOverall: 4,
      battingOverall: 4,
      fieldingOverall: 6,
      speedOverall: 8,
      starSwing: 'Egg Ball',
      hitCurve: 60,
      hittingTrajectory: 'T4',
      slapHitContact: 55,
      chargeHitContact: 50,
      slapHitPower: 40,
      chargeHitPower: 45,
      speed: 120,
      bunting: 70,
      fielding: 65,
      throwingSpeed: 50,
      preCharge: 'No',
      starPitch: 'Egg Ball',
      fastballSpeed: 100,
      curveballSpeed: 70,
      curve: 50,
      stamina: 35,
    },
  },
];

async function main() {
  console.log('🧪 Testing Player Card Generation with Mock Data\n');

  const outputDir = path.join(__dirname, 'output', 'test');

  // Load league logo
  console.log('Loading league logo...');
  const leagueLogoBase64 = loadLeagueLogo();
  if (leagueLogoBase64) {
    console.log('✓ League logo loaded\n');
  } else {
    console.log('⚠ League logo not found\n');
  }

  console.log(`Generating ${mockPlayers.length} test cards...\n`);

  const startTime = Date.now();
  const { success, failed } = await batchGeneratePlayerCards(
    mockPlayers,
    outputDir,
    leagueLogoBase64,
    (current, total, name) => {
      console.log(`  [${current}/${total}] Generating: ${name}`);
    }
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Generation complete in ${elapsed}s`);
  console.log(`   Output directory: ${outputDir}`);
  console.log(`   Successful: ${success.length}`);

  if (failed.length > 0) {
    console.log(`   Failed: ${failed.length}`);
    for (const { name, error } of failed) {
      console.log(`   - ${name}: ${error}`);
    }
  }

  console.log('\nGenerated files:');
  for (const file of success) {
    console.log(`   ${file}`);
  }
}

main();
