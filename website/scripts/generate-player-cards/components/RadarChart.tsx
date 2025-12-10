/**
 * RadarChart Component for Player Cards
 * Renders a heptagon (7-sided) radar chart using SVG
 * Compatible with Satori for image generation
 */

import React from 'react';
import type { RadarAttributes } from '../formulas';

interface RadarChartProps {
  attributes: RadarAttributes;
  size?: number;
}

// Attribute labels in display order (clockwise from top)
const ATTRIBUTE_LABELS = ['AVG', 'POW', 'STF', 'STA', 'FLD', 'ARM', 'SPD'];
const ATTRIBUTE_KEYS: (keyof RadarAttributes)[] = [
  'average',
  'power',
  'stuff',
  'stamina',
  'fielding',
  'arm',
  'speed',
];

// Colors from Tailwind theme
const COLORS = {
  background: '#151829',      // space-navy
  gridLine: '#2D3348',        // cosmic-border
  fillColor: 'rgba(0, 212, 255, 0.3)', // nebula-cyan with transparency
  strokeColor: '#00D4FF',     // nebula-cyan
  labelColor: '#E8EDF5',      // star-white
  valueColor: '#9BA5C0',      // star-gray
};

/**
 * Calculate point on polygon at given angle and radius
 * Angle 0 = top, clockwise
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  // Convert to radians, offset by -90 to start from top
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Generate polygon points string for SVG
 */
function generatePolygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  numSides: number
): string {
  const angleStep = 360 / numSides;
  const points: string[] = [];

  for (let i = 0; i < numSides; i++) {
    const angle = i * angleStep;
    const point = polarToCartesian(centerX, centerY, radius, angle);
    points.push(`${point.x},${point.y}`);
  }

  return points.join(' ');
}

/**
 * Generate data polygon points based on attribute values (0-100)
 */
function generateDataPoints(
  centerX: number,
  centerY: number,
  maxRadius: number,
  values: number[]
): string {
  const angleStep = 360 / values.length;
  const points: string[] = [];

  for (let i = 0; i < values.length; i++) {
    const angle = i * angleStep;
    const valueRadius = (values[i] / 100) * maxRadius;
    const point = polarToCartesian(centerX, centerY, valueRadius, angle);
    points.push(`${point.x},${point.y}`);
  }

  return points.join(' ');
}

export function RadarChart({ attributes, size = 280 }: RadarChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.38; // Leave room for labels
  const labelRadius = size * 0.48;
  const numSides = 7;

  // Get values in order
  const values = ATTRIBUTE_KEYS.map((key) => attributes[key]);

  // Generate grid rings (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={maxRadius}
          fill={COLORS.background}
          opacity={0.5}
        />

        {/* Grid rings */}
        {gridLevels.map((level, index) => (
          <polygon
            key={`grid-${index}`}
            points={generatePolygonPoints(centerX, centerY, maxRadius * level, numSides)}
            fill="none"
            stroke={COLORS.gridLine}
            strokeWidth={1}
            opacity={0.6}
          />
        ))}

        {/* Axis lines from center to each vertex */}
        {Array.from({ length: numSides }).map((_, i) => {
          const angle = (i * 360) / numSides;
          const endPoint = polarToCartesian(centerX, centerY, maxRadius, angle);
          return (
            <line
              key={`axis-${i}`}
              x1={centerX}
              y1={centerY}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke={COLORS.gridLine}
              strokeWidth={1}
              opacity={0.4}
            />
          );
        })}

        {/* Data polygon fill */}
        <polygon
          points={generateDataPoints(centerX, centerY, maxRadius, values)}
          fill={COLORS.fillColor}
          stroke={COLORS.strokeColor}
          strokeWidth={2}
        />

        {/* Data points */}
        {values.map((value, i) => {
          const angle = (i * 360) / numSides;
          const valueRadius = (value / 100) * maxRadius;
          const point = polarToCartesian(centerX, centerY, valueRadius, angle);
          return (
            <circle
              key={`point-${i}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={COLORS.strokeColor}
            />
          );
        })}
      </svg>

      {/* Labels positioned around the chart */}
      {ATTRIBUTE_LABELS.map((label, i) => {
        const angle = (i * 360) / numSides;
        const labelPoint = polarToCartesian(centerX, centerY, labelRadius, angle);
        const value = Math.round(values[i]);

        return (
          <div
            key={`label-${i}`}
            style={{
              position: 'absolute',
              left: labelPoint.x,
              top: labelPoint.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.labelColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.strokeColor,
              }}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default RadarChart;
