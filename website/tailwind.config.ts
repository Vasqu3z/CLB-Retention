import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface-dark)",
          dark: "var(--surface-dark)",
          light: "var(--surface-light)",
        },
        comets: {
          yellow: "var(--comets-yellow)",
          red: "var(--comets-red)",
          blue: "var(--comets-blue)",
          cyan: "var(--comets-cyan)",
          purple: "var(--comets-purple)",
        },

        // === LEGACY COLORS (for existing pages until updated) ===
        'space-black': '#0B0D1E',
        'space-navy': '#151829',
        'space-blue': '#1E2442',
        'space-purple': '#2A1F3D',
        'nebula-orange': '#FF6B35',
        'nebula-coral': '#FF8C61',
        'comet-yellow': '#FFD23F',
        'solar-gold': '#FFA62B',
        'star-pink': '#FF6F91',
        'nebula-cyan': '#00D4FF',
        'nebula-teal': '#00FFC6',
        'nebula-purple': '#A78BFA',
        'field-green': '#2D5F3F',
        'infield-dirt': '#A0826D',
        'vintage-cream': '#FFF8DC',
        'leather-brown': '#8B4513',
        'chalk-white': '#FAFAF9',
        'dugout-blue': '#1E3A5F',
        'cosmic-purple': '#8B5CF6',
        'deep-violet': '#6D28D9',
        'royal-purple': '#7C3AED',
        'star-white': '#E8EDF5',
        'star-gray': '#9BA5C0',
        'star-dim': '#4A5270',
        'cosmic-border': '#2D3348',
        primary: '#FF6B35',
        secondary: '#FFA62B',
        success: '#00FFC6',
        danger: '#FF6B35',
        warning: '#FFD23F',
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        body: ["var(--font-body)", "sans-serif"],
        ui: ["var(--font-ui)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        stat: ["var(--font-syne)", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      boxShadow: {
        panel: '0 4px 16px rgba(0, 0, 0, 0.3)',
        'panel-strong': '0 8px 32px rgba(255, 107, 53, 0.25)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 162, 43, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
        DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.5)',
        strong: '0 2px 12px rgba(0, 0, 0, 0.8)',
        glow: '0 0 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
        'glow-orange': '0 0 30px rgba(255, 107, 53, 0.6), 0 2px 8px rgba(0, 0, 0, 0.8)',
        neon: '0 0 10px currentColor',
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') as Record<string, string> }
      );
    }),
  ],
};

export default config;
