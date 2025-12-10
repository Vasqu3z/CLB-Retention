/**
 * Card Generation Pipeline
 * Converts React components to PNG using Satori and Resvg
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import { PlayerCard, type PlayerCardData } from './components/PlayerCard';
import { calculateRadarAttributes, type PlayerAttributeInput } from './formulas';
import type { PlayerCardInput, PlayerAttributes } from './fetchData';

// Card dimensions
const CARD_WIDTH = 400;
const CARD_HEIGHT = 550;

// Font loading
let interRegular: ArrayBuffer | null = null;
let interMedium: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;

/**
 * Load fonts for Satori rendering
 * Uses local @fontsource/inter package fonts
 */
async function loadFonts(): Promise<{ name: string; data: ArrayBuffer; weight: number }[]> {
  if (!interRegular) {
    const fontsDir = path.join(__dirname, '../../node_modules/@fontsource/inter/files');

    // Load Inter Regular (400)
    const regularPath = path.join(fontsDir, 'inter-latin-400-normal.woff');
    interRegular = fs.readFileSync(regularPath);

    // Load Inter Medium (500)
    const mediumPath = path.join(fontsDir, 'inter-latin-500-normal.woff');
    interMedium = fs.readFileSync(mediumPath);

    // Load Inter Bold (700)
    const boldPath = path.join(fontsDir, 'inter-latin-700-normal.woff');
    interBold = fs.readFileSync(boldPath);
  }

  return [
    {
      name: 'Inter',
      data: interRegular,
      weight: 400,
    },
    {
      name: 'Inter',
      data: interMedium,
      weight: 500,
    },
    {
      name: 'Inter',
      data: interBold,
      weight: 700,
    },
  ];
}

/**
 * Convert player attributes to radar chart input format
 */
function attributesToRadarInput(attrs: PlayerAttributes): PlayerAttributeInput {
  return {
    characterClass: attrs.characterClass,
    hittingTrajectory: attrs.hittingTrajectory,
    slapHitPower: attrs.slapHitPower,
    chargeHitPower: attrs.chargeHitPower,
    fastballSpeed: attrs.fastballSpeed,
    curve: attrs.curve,
    stamina: attrs.stamina,
    fielding: attrs.fielding,
    throwingSpeed: attrs.throwingSpeed,
    speed: attrs.speed,
  };
}

/**
 * Build PlayerCardData from input
 */
function buildCardData(input: PlayerCardInput, imageBase64?: string): PlayerCardData {
  const radarInput = attributesToRadarInput(input.attributes);
  const radarAttributes = calculateRadarAttributes(radarInput);

  return {
    name: input.name,
    characterClass: input.attributes.characterClass,
    imageUrl: imageBase64 || input.imageUrl,
    armSide: input.attributes.armSide || 'R',
    battingSide: input.attributes.battingSide || 'R',
    ability: input.attributes.ability || 'None',
    starSwing: input.attributes.starSwing || '',
    starPitch: input.attributes.starPitch || '',
    radarAttributes,
  };
}

/**
 * Fetch and encode an image URL as base64
 */
async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  if (!url) return undefined;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${url}`);
      return undefined;
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.warn(`Error fetching image ${url}:`, error);
    return undefined;
  }
}

/**
 * Generate a single player card as PNG
 */
export async function generatePlayerCardPNG(
  input: PlayerCardInput,
  leagueLogoBase64?: string
): Promise<Buffer> {
  // Load fonts
  const fonts = await loadFonts();

  // Fetch player image if URL provided
  const imageBase64 = await fetchImageAsBase64(input.imageUrl);

  // Build card data
  const cardData = buildCardData(input, imageBase64);

  // Generate SVG using Satori
  const svg = await satori(
    <PlayerCard player={cardData} leagueLogoBase64={leagueLogoBase64} />,
    {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      fonts,
    }
  );

  // Convert SVG to PNG using Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: CARD_WIDTH,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

/**
 * Generate and save a player card to disk
 */
export async function generateAndSavePlayerCard(
  input: PlayerCardInput,
  outputDir: string,
  leagueLogoBase64?: string
): Promise<string> {
  const pngBuffer = await generatePlayerCardPNG(input, leagueLogoBase64);

  // Sanitize filename
  const safeName = input.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${safeName}.png`;
  const outputPath = path.join(outputDir, filename);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pngBuffer);
  return outputPath;
}

/**
 * Batch generate player cards
 */
export async function batchGeneratePlayerCards(
  players: PlayerCardInput[],
  outputDir: string,
  leagueLogoBase64?: string,
  onProgress?: (current: number, total: number, name: string) => void
): Promise<{ success: string[]; failed: { name: string; error: string }[] }> {
  const success: string[] = [];
  const failed: { name: string; error: string }[] = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    try {
      onProgress?.(i + 1, players.length, player.name);

      const outputPath = await generateAndSavePlayerCard(
        player,
        outputDir,
        leagueLogoBase64
      );

      success.push(outputPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate card for ${player.name}:`, errorMessage);
      failed.push({ name: player.name, error: errorMessage });
    }
  }

  return { success, failed };
}
