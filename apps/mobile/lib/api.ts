// apps/mobile/lib/api.ts
import type {
  SearchParams,
  PaginatedResponse,
  InventoryItem,
  Store,
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
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Search / Browse ──────────────────────────────────────────────

export function searchItems(params: SearchParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  return request<PaginatedResponse<InventoryItem>>(`/api/search?${qs.toString()}`);
}

// ── Stores ───────────────────────────────────────────────────────

export function getStores() {
  return request<Store[]>('/api/stores');
}

export function getStore(id: string) {
  return request<Store>(`/api/stores/${id}`);
}

// ── Item Detail ──────────────────────────────────────────────────

export function getItem(storeId: string, itemId: string) {
  return request<InventoryItem>(`/api/stores/${storeId}/items/${itemId}`);
}
