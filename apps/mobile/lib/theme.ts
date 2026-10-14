// apps/mobile/lib/theme.ts
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { useColorScheme } from 'nativewind';

/**
 * JS mirror of the CSS variables in global.css, for places that can't take a className
 * (navigation theme, ActivityIndicator/RefreshControl colors, placeholderTextColor, etc.).
 * Read it through useThemeColors() so values follow the active color scheme.
 */
export const THEME = {
  light: {
    background: 'hsl(40 18% 96.5%)',
    foreground: 'hsl(213 30% 16%)',
    card: 'hsl(40 20% 99%)',
    cardForeground: 'hsl(213 30% 16%)',
    popover: 'hsl(40 20% 99%)',
    popoverForeground: 'hsl(213 30% 16%)',
    primary: 'hsl(348.5 32.9% 31%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(40 14% 91%)',
    secondaryForeground: 'hsl(213 30% 16%)',
    muted: 'hsl(40 14% 91%)',
    mutedForeground: 'hsl(35 6% 38%)',
    accent: 'hsl(211 45% 92%)',
    accentForeground: 'hsl(211.2 35.2% 41.8%)',
    destructive: 'hsl(358 60% 50%)',
    success: 'hsl(169.7 60% 30%)',
    border: 'hsl(40 12% 86%)',
    input: 'hsl(40 9% 77%)',
    ring: 'hsl(211.2 35.2% 41.8%)',
    radius: '0.625rem',
  },
  dark: {
    background: 'hsl(213 30% 10%)',
    foreground: 'hsl(40 40% 94%)',
    card: 'hsl(213 26% 14%)',
    cardForeground: 'hsl(40 40% 94%)',
    popover: 'hsl(213 26% 14%)',
    popoverForeground: 'hsl(40 40% 94%)',
    primary: 'hsl(35.8 79.8% 67.1%)',
    primaryForeground: 'hsl(213 30% 10%)',
    secondary: 'hsl(213 22% 20%)',
    secondaryForeground: 'hsl(40 40% 94%)',
    muted: 'hsl(213 22% 20%)',
    mutedForeground: 'hsl(38 12% 68%)',
    accent: 'hsl(211.2 33% 24%)',
    accentForeground: 'hsl(211 50% 71%)',
    destructive: 'hsl(358 79.1% 70%)',
    success: 'hsl(162.4 67.7% 57.5%)',
    border: 'hsl(213 20% 22%)',
    input: 'hsl(213 18% 28%)',
    ring: 'hsl(162.4 67.7% 57.5%)',
    radius: '0.625rem',
  },
};

export type ThemeColors = (typeof THEME)['light'];

function navTheme(base: Theme, colors: ThemeColors): Theme {
  return {
    ...base,
    colors: {
      background: colors.background,
      border: colors.border,
      card: colors.card,
      notification: colors.destructive,
      primary: colors.primary,
      text: colors.foreground,
    },
  };
}

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: navTheme(DefaultTheme, THEME.light),
  dark: navTheme(DarkTheme, THEME.dark),
};

/** The active scheme's THEME colors; re-renders when the system appearance changes. */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return THEME[colorScheme === 'dark' ? 'dark' : 'light'];
}
