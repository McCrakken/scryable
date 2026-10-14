// apps/mobile/lib/theme.ts
import { DarkTheme, type Theme } from 'expo-router';

/**
 * JS mirror of the CSS variables in global.css, for places that can't take a className
 * (navigation theme, ActivityIndicator/RefreshControl colors, placeholderTextColor, etc.).
 */
export const THEME = {
  background: 'hsl(240 40% 9.8%)',
  foreground: 'hsl(0 0% 87.8%)',
  card: 'hsl(240 27.8% 14.1%)',
  cardForeground: 'hsl(0 0% 87.8%)',
  popover: 'hsl(240 27.8% 14.1%)',
  popoverForeground: 'hsl(0 0% 87.8%)',
  primary: 'hsl(262.1 83.3% 57.8%)',
  primaryForeground: 'hsl(0 0% 100%)',
  secondary: 'hsl(240 27.6% 22.7%)',
  secondaryForeground: 'hsl(240 34% 81.6%)',
  muted: 'hsl(240 27.6% 22.7%)',
  mutedForeground: 'hsl(240 20.3% 69%)',
  accent: 'hsl(259.8 59.5% 30%)',
  accentForeground: 'hsl(255.1 91.7% 76.3%)',
  destructive: 'hsl(0 84.2% 60.2%)',
  success: 'hsl(158.1 64.4% 51.6%)',
  border: 'hsl(240 27.6% 22.7%)',
  input: 'hsl(240 21.6% 29%)',
  ring: 'hsl(265 88.3% 66.5%)',
  radius: '0.625rem',
};

export const NAV_THEME: Theme = {
  ...DarkTheme,
  colors: {
    background: THEME.background,
    border: THEME.border,
    card: THEME.card,
    notification: THEME.destructive,
    primary: THEME.primary,
    text: THEME.foreground,
  },
};
