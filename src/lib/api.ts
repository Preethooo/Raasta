// Tiny client for /api. Every request carries the CSRF header the server requires on mutations.
import { useCallback, useEffect, useState } from 'react';
import type { ListingContent, ListingStatus, SupplierStatus } from '@/shared/marketplace';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: string[]) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    credentials: 'same-origin',
    headers: { 'x-raasta-client': '1', ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Request failed (${res.status})`, data.details);
  return data as T;
}

/** Fetch on mount (and on `reload()`), tracking loading and error state. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(!!path);
  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(0, 'Could not reach the server.'));
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload, setData };
}

// ---- response shapes --------------------------------------------------------------------

export type Supplier = {
  id: string;
  businessName: string;
  phone: string;
  city: string;
  about: string;
  categories: string[];
  status: SupplierStatus;
  createdAt: string;
  email?: string;
  contactName?: string;
};

export type Listing = {
  id: string;
  status: ListingStatus;
  draft: ListingContent;
  published: ListingContent | null;
  reviewNote: string;
  submittedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasDraftChanges: boolean;
};

export type Me = {
  user: { id: string; email: string; name: string; role: 'supplier' | 'admin' } | null;
  supplier?: Supplier | null;
};

export type CatalogItem = ListingContent & { id: string; supplier: { name: string; city: string }; publishedAt: string };

/** Shrinks a photo in the browser (max 1600px, JPEG) and uploads it. Returns its /api/media URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((ok, fail) =>
    canvas.toBlob((b) => (b ? ok(b) : fail(new Error('Could not read that image.'))), 'image/jpeg', 0.85),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const { url } = await api<{ url: string }>('media', { body: { mime: 'image/jpeg', data: btoa(bin) } });
  return url;
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
