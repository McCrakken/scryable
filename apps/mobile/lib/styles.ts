// apps/mobile/lib/styles.ts

/**
 * Centralized NativeWind class string constants for Scryable mobile.
 *
 * Usage:
 *   import { ui } from '@/lib/styles';
 *   <View className={ui.screen}>
 */
export const ui = {
  // ── Layout ──────────────────────────────────────────
  screen: 'flex-1 bg-bg-base px-4',
  card: 'bg-bg-surface rounded-xl p-4 mb-3 border border-bg-elevated',
  row: 'flex-row items-center',
  rowBetween: 'flex-row items-center justify-between',
  center: 'flex-1 items-center justify-center bg-bg-base',

  // ── Typography ──────────────────────────────────────
  heading: 'text-text-primary text-2xl font-bold',
  subheading: 'text-text-primary text-lg font-semibold',
  body: 'text-text-primary text-base',
  label: 'text-text-muted text-xs font-bold uppercase tracking-widest',
  muted: 'text-text-dim text-sm',
  faint: 'text-text-faint text-sm text-center',

  // ── Inputs ──────────────────────────────────────────
  input: 'flex-1 bg-bg-surface text-text-primary rounded-lg p-3 text-base border border-bg-elevated',

  // ── Buttons ─────────────────────────────────────────
  btnPrimary: 'bg-brand rounded-lg py-4 items-center',
  btnPrimaryDisabled: 'bg-brand-dim opacity-70',
  btnPrimaryText: 'text-white text-base font-bold',
  btnSecondary: 'bg-bg-elevated rounded-lg px-4 py-2 items-center justify-center border border-bg-overlay',
  btnSecondaryText: 'text-accent-purple text-sm font-semibold',

  // ── Tags / Chips ─────────────────────────────────────
  tag: 'bg-bg-elevated text-accent-purple px-2 py-1 rounded text-xs overflow-hidden',
  chip: 'bg-bg-elevated rounded-full px-4 py-2 border border-bg-overlay',
  chipActive: 'bg-brand rounded-full px-4 py-2 border border-brand-light',
  chipText: 'text-text-secondary text-sm font-medium',
  chipTextActive: 'text-white text-sm font-bold',
  activeChip: 'bg-brand-muted rounded-full px-3 py-1.5 border border-brand',
  activeChipText: 'text-accent-purple text-sm font-semibold',

  // ── Feedback ─────────────────────────────────────────
  errorText: 'text-accent-red text-base text-center',
  price: 'text-accent-green text-lg font-bold',
  soldBadge: 'text-accent-red text-base font-bold bg-accent-red-bg p-2 rounded text-center overflow-hidden mt-3',

  // ── Bottom Sheet ─────────────────────────────────────
  sheetHeader: 'flex-row items-center justify-between py-4',
  sheetTitle: 'text-text-primary text-xl font-bold',
  sheetClear: 'text-accent-purple text-base font-semibold',
} as const;
