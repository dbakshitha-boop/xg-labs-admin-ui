export const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';

function normalizeId<T>(item: T & { _id?: string; id?: string }): T {
  if (item._id && !item.id) {
    const { _id, ...rest } = item as any;
    return { id: _id, ...rest } as T;
  }
  return item;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (Array.isArray(data)) return data.map(normalizeId) as T;
  return normalizeId(data) as T;
}

export function createRestApi<T extends { id: string }>(resource: string) {
  const base = `/api/${resource}`;
  return {
    getAll: (): Promise<T[]> =>
      request<T[]>(base),

    add: (item: Omit<T, 'id'>): Promise<T> =>
      request<T>(base, { method: 'POST', body: JSON.stringify(item) }),

    update: (id: string, data: Partial<T>): Promise<void> =>
      request<void>(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string): Promise<void> =>
      request<void>(`${base}/${id}`, { method: 'DELETE' }),
  };
}
