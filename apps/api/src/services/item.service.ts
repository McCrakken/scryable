import { prisma } from '../lib/prisma';
import { Platform, Category, Condition } from '../generated/prisma/client';

export interface CreateItemData {
  title: string;
  description?: string;
  platform: Platform;
  category: Category;
  condition: Condition;
  price: number;
  imageUrls?: string[];
  isPromoted?: boolean;
}

export type UpdateItemData = Partial<CreateItemData> & { isSold?: boolean };

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
};

/** Confirm the store exists and is owned by the given user. */
async function verifyStoreOwnership(storeId: string, ownerId: string): Promise<boolean> {
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId } });
  return store !== null;
}

export async function createItem(storeId: string, ownerId: string, data: CreateItemData) {
  const owns = await verifyStoreOwnership(storeId, ownerId);
  if (!owns) return null;

  return prisma.inventoryItem.create({
    data: {
      storeId,
      ...data,
      price: data.price,
      imageUrls: data.imageUrls ?? [],
    },
    select: itemSelect,
  });
}

export async function getItemsByStore(storeId: string) {
  return prisma.inventoryItem.findMany({
    where: { storeId },
    select: itemSelect,
    orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getItemById(id: string) {
  return prisma.inventoryItem.findUnique({
    where: { id },
    select: itemSelect,
  });
}

export async function updateItem(id: string, ownerId: string, data: UpdateItemData) {
  // Find the item and verify the requester owns its parent store
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    select: { storeId: true },
  });
  if (!item) return null;

  const owns = await verifyStoreOwnership(item.storeId, ownerId);
  if (!owns) return null;

  return prisma.inventoryItem.update({
    where: { id },
    data,
    select: itemSelect,
  });
}

export async function deleteItem(id: string, ownerId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    select: { storeId: true },
  });
  if (!item) return null;

  const owns = await verifyStoreOwnership(item.storeId, ownerId);
  if (!owns) return null;

  await prisma.inventoryItem.delete({ where: { id } });
  return true;
}
