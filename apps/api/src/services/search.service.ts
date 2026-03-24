import { prisma } from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { Platform, Category, Condition } from '../generated/prisma/client';

export interface SearchFilters {
  query?: string;
  platform?: Platform;
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  storeId?: string;
  page: number;
  limit: number;
}

export interface SearchResult {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const itemSelect = {
  id: true,
  storeId: true,
  title: true,
  description: true,
  platform: true,
  category: true,
  condition: true,
  price: true,
  imageUrls: true,
  isPromoted: true,
  isSold: true,
  createdAt: true,
  updatedAt: true,
  store: {
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
    },
  },
};

export async function searchItems(filters: SearchFilters): Promise<SearchResult> {
  const { query, platform, category, condition, minPrice, maxPrice, storeId, page, limit } =
    filters;

  // Build the where clause incrementally
  const where: Prisma.InventoryItemWhereInput = {
    isSold: false, // Never surface sold items in search results
  };

  // Full-text style search across title and description
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (platform) where.platform = platform;
  if (category) where.category = category;
  if (condition) where.condition = condition;
  if (storeId) where.storeId = storeId;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  // Run count and data fetch in parallel for performance
  const [total, data] = await Promise.all([
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      select: itemSelect,
      orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
