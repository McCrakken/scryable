// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for className usage
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ────────────────────────────
        bg: {
          base: '#0f0f23',      // Screen background
          surface: '#1a1a2e',   // Cards, inputs, sheet background
          elevated: '#2a2a4a',  // Tags, chips, hover states
          overlay: '#3a3a5a',   // Borders on elevated surfaces
        },
        // ── Brand / Accent ─────────────────────────
        brand: {
          DEFAULT: '#7c3aed',   // Primary purple — buttons, focus rings
          light: '#9d5ef5',     // Lighter purple — borders on active chips
          dim: '#4a2590',       // Dimmed purple — disabled state
          muted: '#3d1f7a',     // Very dim — active chip background
        },
        // ── Text ───────────────────────────────────
        text: {
          primary: '#e0e0e0',   // Main body text
          secondary: '#c0c0e0', // Chip labels, subdued text
          muted: '#a0a0c0',     // Section labels
          dim: '#888888',       // Placeholders, filter labels
          faint: '#666666',     // Empty state text
        },
        // ── Semantic ───────────────────────────────
        accent: {
          purple: '#a78bfa',    // Tags, links
          green: '#34d399',     // Price, success
          red: '#ef4444',       // Errors, sold badge
          'red-bg': '#2a1a1a',  // Sold badge background
        },
      },
    },
  },
  plugins: [],
};
