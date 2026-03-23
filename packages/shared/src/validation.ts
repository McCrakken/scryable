import { z } from 'zod';
import { PLATFORMS, CONDITIONS, CATEGORIES, ROLES } from './types';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  role: z.enum(ROLES),
});

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).default(''),
  platform: z.enum(PLATFORMS),
  category: z.enum(CATEGORIES),
  condition: z.enum(CONDITIONS),
  price: z.number().min(0, 'Price must be positive').max(99999.99),
  imageUrls: z.array(z.string().url()).max(10).default([]),
  isPromoted: z.boolean().default(false),
});

export const updateItemSchema = createItemSchema.partial().extend({
  isSold: z.boolean().optional(),
});

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  platform: z.enum(PLATFORMS).optional(),
  category: z.enum(CATEGORIES).optional(),
  condition: z.enum(CONDITIONS).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  storeId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
