import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Base
        'space-black': 'var(--space-black)',
        'space-navy': 'var(--space-navy)',
        'space-blue': 'var(--space-blue)',
        'space-purple': 'var(--space-purple)',

        // Warm Nebula Accents
        'nebula-orange': 'var(--nebula-orange)',
        'nebula-coral': 'var(--nebula-coral)',
        'comet-yellow': 'var(--comet-yellow)',
        'solar-gold': 'var(--solar-gold)',
        'star-pink': 'var(--star-pink)',

        // Cool Accents
        'nebula-cyan': 'var(--nebula-cyan)',
        'nebula-teal': 'var(--nebula-teal)',
        'nebula-purple': 'rgb(var(--nebula-purple) / <alpha-value>)',

        // Baseball-Specific Colors
        'field-green': 'var(--field-green)',
        'infield-dirt': 'var(--infield-dirt)',
        'vintage-cream': 'var(--vintage-cream)',
        'leather-brown': 'var(--leather-brown)',
        'chalk-white': 'var(--chalk-white)',
        'dugout-blue': 'var(--dugout-blue)',

        // Enhanced Purple Palette
        'cosmic-purple': 'var(--cosmic-purple)',
        'deep-violet': 'var(--deep-violet)',
        'royal-purple': 'var(--royal-purple)',

        // Atmosphere/Text
        'star-white': 'var(--star-white)',
        'star-gray': 'var(--star-gray)',
        'star-dim': 'var(--star-dim)',
        'cosmic-border': 'var(--cosmic-border)',

        // Functional (aliased for convenience)
        primary: 'var(--nebula-orange)',
        secondary: 'var(--solar-gold)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        'display': ['var(--font-barlow)', 'sans-serif'],
        'body': ['var(--font-azeret-mono)', 'monospace'],
        'mono': ['var(--font-jetbrains-mono)', 'monospace'],
        'stat': ['var(--font-syne)', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
};
export default config;
