/**
 * Development seed. Wipes the inventory/store/user tables and repopulates them
 * with retro game shops and real second-hand merchandise.
 *
 *   yarn workspace @scryable/api db:seed
 *
 * Everything is deterministic: ids are derived from stable keys and all
 * randomness comes from a fixed-seed PRNG, so re-running produces the same
 * rows and the ids you paste into http-client.env.json keep working.
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { Condition } from '../src/generated/prisma/client';
import { getPrisma } from '../src/lib/prisma';
import { hashPassword } from '../src/services/auth.service';
import {
  CATALOG,
  HOT_TITLES,
  OWNERS,
  SEED_PASSWORD,
  USERS,
  type CatalogEntry,
  type SeedStore,
} from './seed-data';

const PRNG_SEED = 0x5c27ab1e;
const ITEM_HISTORY_DAYS = 180;
const SOLD_RATE = 0.12;
const PROMOTED_RATE = 0.15;

/** Price relative to the catalog's complete-in-box reference value. */
const CONDITION_MULTIPLIER: Record<Condition, number> = {
  [Condition.sealed]: 3.5,
  [Condition.cib]: 1,
  [Condition.loose]: 0.45,
  [Condition.fair]: 0.3,
  [Condition.poor]: 0.15,
};

/** Weighted draw pool — loose carts are what actually fills a shop's shelves. */
const CONDITION_POOL: Condition[] = [
  ...Array<Condition>(40).fill(Condition.loose),
  ...Array<Condition>(30).fill(Condition.cib),
  ...Array<Condition>(15).fill(Condition.fair),
  ...Array<Condition>(9).fill(Condition.poor),
  ...Array<Condition>(6).fill(Condition.sealed),
];

// ─── Determinism helpers ───────────────────────────────────────────────────

/** UUIDv5-style id derived from a stable key, so re-seeding keeps ids intact. */
function stableId(key: string): string {
  const h = createHash('sha1').update(`scryable:seed:${key}`).digest();
  const bytes = Buffer.from(h.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/** mulberry32 — small deterministic PRNG so prices and conditions are stable. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(PRNG_SEED);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Item construction ─────────────────────────────────────────────────────

/** Nudge to a retail-looking .99, with a floor so nothing lists for pennies. */
function listingPrice(basePrice: number, condition: Condition): string {
  const raw = basePrice * CONDITION_MULTIPLIER[condition];
  const rounded = raw < 10 ? Math.round(raw * 2) / 2 : Math.round(raw);
  return Math.max(1.99, rounded - 0.01).toFixed(2);
}

function imageUrls(entry: CatalogEntry, count: number): string[] {
  const label = encodeURIComponent(`${entry.title}\n${entry.platform}`);
  return Array.from(
    { length: count },
    (_, i) => `https://placehold.co/600x840/1f2937/f9fafb.png?text=${label}%0A(${i + 1})`,
  );
}

function buildItem(entry: CatalogEntry, storeId: string, storeKey: string, now: number) {
  const condition = pick(CONDITION_POOL);
  const isPromoted = random() < PROMOTED_RATE;
  const daysAgo = Math.floor(random() * ITEM_HISTORY_DAYS);
  const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

  return {
    id: stableId(`item:${storeKey}:${entry.platform}:${entry.title}`),
    storeId,
    title: entry.title,
    description: entry.description,
    platform: entry.platform,
    category: entry.category,
    condition,
    price: listingPrice(entry.basePrice, condition),
    imageUrls: imageUrls(entry, isPromoted ? 2 : 1),
    isPromoted,
    isSold: random() < SOLD_RATE,
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Deal the catalog out across stores round-robin, then give the popular titles
 * a second and third home so cross-store searches return more than one hit.
 */
function assignCatalog(stores: { key: string; id: string }[]) {
  const assignments: { entry: CatalogEntry; store: { key: string; id: string } }[] = [];

  shuffled(CATALOG).forEach((entry, index) => {
    assignments.push({ entry, store: stores[index % stores.length] });
  });

  const hot = new Set(HOT_TITLES);
  for (const entry of CATALOG) {
    if (!hot.has(entry.title)) continue;
    const alreadyIn = new Set(
      assignments.filter((a) => a.entry.title === entry.title).map((a) => a.store.key),
    );
    for (const store of shuffled(stores)) {
      if (alreadyIn.size >= 3) break;
      if (alreadyIn.has(store.key)) continue;
      assignments.push({ entry, store });
      alreadyIn.add(store.key);
    }
  }

  return assignments;
}

// ─── Seed ──────────────────────────────────────────────────────────────────

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_FORCE !== 'true') {
    throw new Error('Refusing to seed with NODE_ENV=production. Set SEED_FORCE=true to override.');
  }

  const prisma = getPrisma();
  const now = Date.now();

  console.log('Clearing existing data...');
  await prisma.inventoryItem.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // One hash for every account — bcrypt at cost 12 is slow and this is a fixture.
  const passwordHash = await hashPassword(SEED_PASSWORD);

  console.log('Creating users...');
  await prisma.user.createMany({
    data: [
      ...OWNERS.map((owner) => ({
        id: stableId(`user:${owner.key}`),
        email: owner.email,
        passwordHash,
        displayName: owner.displayName,
        role: 'owner' as const,
      })),
      ...USERS.map((user) => ({
        id: stableId(`user:${user.key}`),
        email: user.email,
        passwordHash,
        displayName: user.displayName,
        role: 'user' as const,
      })),
    ],
  });

  console.log('Creating stores...');
  const storeRows = OWNERS.flatMap((owner) =>
    owner.stores.map((store: SeedStore) => ({
      key: store.key,
      row: {
        id: stableId(`store:${store.key}`),
        ownerId: stableId(`user:${owner.key}`),
        name: store.name,
        description: store.description,
        address: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        phone: store.phone ?? null,
        website: store.website ?? null,
      },
    })),
  );
  await prisma.store.createMany({ data: storeRows.map((s) => s.row) });

  console.log('Creating inventory...');
  const stores = storeRows.map((s) => ({ key: s.key, id: s.row.id }));
  const items = assignCatalog(stores).map(({ entry, store }) =>
    buildItem(entry, store.id, store.key, now),
  );
  await prisma.inventoryItem.createMany({ data: items });

  // ─── Summary ─────────────────────────────────────────────────────────────
  const sold = items.filter((i) => i.isSold).length;
  const promoted = items.filter((i) => i.isPromoted).length;

  console.log('\nSeed complete');
  console.log(`  users      ${OWNERS.length + USERS.length} (${OWNERS.length} owners)`);
  console.log(`  stores     ${storeRows.length}`);
  console.log(`  items      ${items.length} (${sold} sold, ${promoted} promoted)`);
  console.log(`\n  Password for every account: ${SEED_PASSWORD}`);
  console.log(`  Owner login:  ${OWNERS[0].email}`);
  console.log(`  User login:   ${USERS[0].email}`);

  const firstStoreId = storeRows[0].row.id;
  console.log('\n  For http-client.env.json:');
  console.log(`    "storeId": "${firstStoreId}"`);
  console.log(`    "itemId":  "${items.find((i) => i.storeId === firstStoreId)?.id ?? ''}"`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
