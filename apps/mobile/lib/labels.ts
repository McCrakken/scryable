// apps/mobile/lib/labels.ts
import type { Category, Condition } from '@scryable/shared';

export const CONDITION_LABELS: Record<Condition, string> = {
  sealed: 'Sealed',
  cib: 'Complete in Box',
  loose: 'Loose',
  fair: 'Fair',
  poor: 'Poor',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  game: 'Game',
  console: 'Console',
  accessory: 'Accessory',
  'strategy-guide': 'Strategy Guide',
  merchandise: 'Merchandise',
  other: 'Other',
};
