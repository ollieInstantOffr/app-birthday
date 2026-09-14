'use client';

import type { GameState, TaskView } from '@/lib/progress';

export type { GameState, TaskView };

export interface FinaleCard {
  taskId: number;
  caption: string;
  message: string;
  photoUrl: string | null;
}

export interface FinaleData {
  cards: FinaleCard[];
  gift: {
    title: string;
    message: string;
    day: string;
    month: string;
    dateLabel: string;
    time: string;
    place: string;
    image: string;
  };
  giftOpened: boolean;
}

export class HttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!res.ok) throw new HttpError(res.status);
  return res.json() as Promise<T>;
}

/** Skalerer ned til maks 1600 px bredde og lager JPEG. iPhone-bilder er store. */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', quality),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadPhoto(taskId: number, file: File): Promise<GameState> {
  const blob = await compressImage(file);
  const { key, url } = await api<{ key: string; url: string }>('/api/uploads/presign', { taskId });
  const viaServer = `/api/uploads/local?key=${encodeURIComponent(key)}`;
  const put = (target: string) => fetch(target, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } });
  let res: Response | null = null;
  try {
    res = await put(url);
  } catch {
    res = null; // nettverks- eller CORS-feil mot S3
  }
  if ((!res || !res.ok) && url !== viaServer) res = await put(viaServer);
  if (!res || !res.ok) throw new HttpError(res?.status ?? 0);
  const done = await api<{ state: GameState }>(`/api/tasks/${taskId}/photo`, { key });
  return done.state;
}

const OSLO = 'Europe/Oslo';

export function osloClock(d: Date): string {
  return new Intl.DateTimeFormat('nb-NO', { timeZone: OSLO, hour: '2-digit', minute: '2-digit' }).format(d);
}

export function eventDayLabel(eventDate: string): string {
  return new Intl.DateTimeFormat('nb-NO', { timeZone: OSLO, day: 'numeric', month: 'long' }).format(
    new Date(`${eventDate}T12:00:00Z`),
  );
}

export function formatCountdown(ms: number, short = false): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (days > 0) return `${days}d ${p(h)}:${p(m)}:${p(s)}`;
  if (short && h === 0) return `${p(m)}:${p(s)}`;
  return `${p(h)}:${p(m)}:${p(s)}`;
}
