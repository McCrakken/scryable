// apps/mobile/lib/api.ts
import type {
  SearchParams,
  PaginatedResponse,
  InventoryItem,
  Store,
  IdentifyItemsResponse,
} from '@scryable/shared';

// In development, use your machine's LAN IP so the phone/emulator can reach it.
// For Android emulator, 10.0.2.2 maps to the host machine's localhost.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? res.statusText, body?.code);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Search / Browse ──────────────────────────────────────────────

export function searchItems(params: SearchParams, signal?: AbortSignal) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return request<PaginatedResponse<InventoryItem>>(`/api/search?${qs.toString()}`, { signal });
}

// ── Stores ───────────────────────────────────────────────────────

export function getStores(signal?: AbortSignal) {
  return request<Store[]>('/api/stores', { signal });
}

export function getStore(id: string, signal?: AbortSignal) {
  return request<Store>(`/api/stores/${id}`, { signal });
}

/** Every item in a store's catalog, sold items included (promoted first, then newest). */
export function getStoreItems(storeId: string, signal?: AbortSignal) {
  return request<InventoryItem[]>(`/api/stores/${storeId}/items`, { signal });
}

// ── Item Detail ──────────────────────────────────────────────────

export function getItem(storeId: string, itemId: string, signal?: AbortSignal) {
  return request<InventoryItem>(`/api/stores/${storeId}/items/${itemId}`, { signal });
}

// ── Inventory Intake (owner / staff) ─────────────────────────────

const STUB_LATENCY_MS = 1500;

const STUB_IDENTIFIED_ITEMS: IdentifyItemsResponse = {
  items: [
    {
      title: 'Super Mario World',
      description: 'Cartridge, box and manual. Light shelf wear on the box.',
      platform: 'SNES',
      category: 'game',
      condition: 'cib',
      price: 89.99,
      imageUrls: [],
    },
    {
      title: 'Nintendo 64 Console',
      description: 'Charcoal grey console with one controller.',
      platform: 'N64',
      category: 'console',
      condition: 'loose',
      price: 109.99,
      imageUrls: [],
    },
  ],
};

/**
 * STUB: AI image search for inventory intake (SPECS §7, planned endpoint).
 * The API doesn't implement `POST /api/stores/:storeId/inventory/identify` yet, so this resolves
 * with sample items after a short delay. When it ships, replace the body with a multipart upload
 * of the photo (field `image`) to that endpoint; callers won't need to change.
 */
export function identifyItems(
  storeId: string,
  photoUri: string,
  signal?: AbortSignal,
): Promise<IdentifyItemsResponse> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(STUB_IDENTIFIED_ITEMS), STUB_LATENCY_MS);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
