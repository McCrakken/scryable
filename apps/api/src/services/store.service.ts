import { prisma } from '../lib/prisma';

export interface CreateStoreData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
}

export type UpdateStoreData = Partial<CreateStoreData>;

const storeSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  phone: true,
  website: true,
  createdAt: true,
  updatedAt: true,
};

export async function createStore(ownerId: string, data: CreateStoreData) {
  return prisma.store.create({
    data: { ownerId, ...data },
    select: storeSelect,
  });
}

export async function getStores() {
  return prisma.store.findMany({
    select: storeSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStoreById(id: string) {
  return prisma.store.findUnique({
    where: { id },
    select: storeSelect,
  });
}

export async function getStoresByOwner(ownerId: string) {
  return prisma.store.findMany({
    where: { ownerId },
    select: storeSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateStore(id: string, ownerId: string, data: UpdateStoreData) {
  // findFirst with both id + ownerId ensures an owner can't edit another owner's store
  const store = await prisma.store.findFirst({ where: { id, ownerId } });
  if (!store) return null;

  return prisma.store.update({
    where: { id },
    data,
    select: storeSelect,
  });
}

export async function deleteStore(id: string, ownerId: string) {
  const store = await prisma.store.findFirst({ where: { id, ownerId } });
  if (!store) return null;

  await prisma.store.delete({ where: { id } });
  return true;
}
