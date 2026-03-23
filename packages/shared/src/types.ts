// === Enums / Unions ===

export const PLATFORMS = [
  'NES',
  'SNES',
  'N64',
  'GameCube',
  'Wii',
  'Wii U',
  'Switch',
  'Game Boy',
  'GBA',
  'DS',
  '3DS',
  'Genesis',
  'Saturn',
  'Dreamcast',
  'PS1',
  'PS2',
  'PS3',
  'PS4',
  'PS5',
  'PSP',
  'PS Vita',
  'Xbox',
  'Xbox 360',
  'Xbox One',
  'Xbox Series X',
  'Atari 2600',
  'TurboGrafx-16',
  'Neo Geo',
  'Other',
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const CONDITIONS = ['sealed', 'cib', 'loose', 'fair', 'poor'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CATEGORIES = [
  'game',
  'console',
  'accessory',
  'strategy-guide',
  'merchandise',
  'other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const ROLES = ['owner', 'user'] as const;
export type Role = (typeof ROLES)[number];

// === Core Models ===

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  title: string;
  description: string;
  platform: Platform;
  category: Category;
  condition: Condition;
  price: number;
  imageUrls: string[];
  isPromoted: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

// === API DTOs ===

export interface CreateItemDto {
  title: string;
  description: string;
  platform: Platform;
  category: Category;
  condition: Condition;
  price: number;
  imageUrls?: string[];
  isPromoted?: boolean;
}

export interface UpdateItemDto extends Partial<CreateItemDto> {
  isSold?: boolean;
}

export interface SearchParams {
  query?: string;
  platform?: Platform;
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  storeId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// === Auth ===

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
