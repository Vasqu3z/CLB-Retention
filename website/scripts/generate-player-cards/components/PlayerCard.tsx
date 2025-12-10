/**
 * PlayerCard Component
 * Baseball card-style layout with player info and radar chart
 * Compatible with Satori for image generation
 */

import React from 'react';
import { RadarChart } from './RadarChart';
import type { RadarAttributes } from '../formulas';

// Colors from Tailwind theme
const COLORS = {
  background: '#0B0D1E',      // space-black
  cardSurface: '#151829',     // space-navy
  cardBorder: '#2D3348',      // cosmic-border
  accent: '#FF6B35',          // nebula-orange
  accentGold: '#FFA62B',      // solar-gold
  cyan: '#00D4FF',            // nebula-cyan
  textPrimary: '#E8EDF5',     // star-white
  textSecondary: '#9BA5C0',   // star-gray
  textDim: '#4A5270',         // star-dim
};

export interface PlayerCardData {
  // Player identity
  name: string;
  characterClass: string;
  imageUrl?: string;

  // Bio info
  armSide: string;
  battingSide: string;
  ability: string;
  starSwing: string;
  starPitch: string;

  // Radar chart data
  radarAttributes: RadarAttributes;
}

interface PlayerCardProps {
  player: PlayerCardData;
  leagueLogoBase64?: string;
}

export function PlayerCard({ player, leagueLogoBase64 }: PlayerCardProps) {
  const cardWidth = 400;
  const cardHeight = 550;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: cardWidth,
        height: cardHeight,
        backgroundColor: COLORS.background,
        padding: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Card container with border */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: COLORS.cardSurface,
          borderRadius: 16,
          border: `2px solid ${COLORS.cardBorder}`,
          overflow: 'hidden',
        }}
      >
        {/* Header with logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {leagueLogoBase64 && (
              <img
                src={leagueLogoBase64}
                width={32}
                height={32}
                style={{ borderRadius: 4 }}
              />
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Season 2 Draft
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              color: COLORS.textDim,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Player Card
          </span>
        </div>

        {/* Player info section */}
        <div
          style={{
            display: 'flex',
            padding: 16,
            gap: 16,
            borderBottom: `1px solid ${COLORS.cardBorder}`,
          }}
        >
          {/* Headshot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              backgroundColor: COLORS.background,
              borderRadius: 8,
              border: `1px solid ${COLORS.cardBorder}`,
              overflow: 'hidden',
            }}
          >
            {player.imageUrl ? (
              <img
                src={player.imageUrl}
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span
                style={{
                  fontSize: 32,
                  color: COLORS.textDim,
                }}
              >
                ?
              </span>
            )}
          </div>

          {/* Name and class */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {player.name}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.accent,
                marginTop: 4,
              }}
            >
              {player.characterClass}
            </span>
          </div>
        </div>

        {/* Radar chart section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0',
            flex: 1,
          }}
        >
          <RadarChart attributes={player.radarAttributes} size={260} />
        </div>

        {/* Bio info footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            gap: 8,
            borderTop: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.background,
          }}
        >
          {/* Row 1: Throws / Bats */}
          <div
            style={{
              display: 'flex',
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>Throws:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>
                {player.armSide}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>Bats:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>
                {player.battingSide}
              </span>
            </div>
          </div>

          {/* Row 2: Ability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: COLORS.textDim }}>Ability:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary }}>
              {player.ability || 'None'}
            </span>
          </div>

          {/* Row 3: Star abilities */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 4,
            }}
          >
            {player.starSwing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.accentGold }}>★</span>
                <span style={{ fontSize: 11, color: COLORS.textDim }}>Swing:</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.textSecondary }}>
                  {player.starSwing}
                </span>
              </div>
            )}
            {player.starPitch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.accentGold }}>★</span>
                <span style={{ fontSize: 11, color: COLORS.textDim }}>Pitch:</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.textSecondary }}>
                  {player.starPitch}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
