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
  /** Feilkoden fra appen, eller «ikke-appen» hvis svaret ikke kom fra appen (f.eks. en proxy). */
  constructor(
    public status: number,
    public code?: string,
  ) {
    super(`HTTP ${status}${code ? ` ${code}` : ''}`);
  }
}

async function errorCode(res: Response): Promise<string> {
  try {
    const json = (await res.clone().json()) as { code?: string; error?: string };
    return json.code ?? json.error ?? 'ukjent';
  } catch {
    return 'ikke-appen';
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
  if (!res.ok) throw new HttpError(res.status, await errorCode(res));
  return res.json() as Promise<T>;
}

export class UnsupportedImageError extends Error {}

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const looksLikeHeic = (file: File) => HEIC_TYPES.includes(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name);

function decode(blob: Blob): Promise<{ img: HTMLImageElement; release: () => void }> {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, release: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

/**
 * HEIC/HEIF (Apples bildeformat) → JPEG, for nettlesere som ikke kan lese det selv
 * (Chrome, Firefox, Android). Safari på iPhone/Mac leser HEIC direkte og trenger ikke dette.
 * Biblioteket lastes bare når det faktisk trengs.
 */
async function convertHeic(file: File): Promise<Blob | null> {
  const { heicTo, isHeic } = await import('heic-to/next');
  if (!looksLikeHeic(file) && !(await isHeic(file).catch(() => false))) return null;
  return heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });
}

/**
 * Gjør et valgt bilde klart: leser JPEG, PNG, HEIC/HEIF osv., skalerer ned til maks 1600 px
 * bredde og lager JPEG. Resultatet brukes både til forhåndsvisning og opplasting, så alt
 * som lagres og vises i appen er vanlig JPEG.
 */
export async function prepareImage(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
  let decoded: Awaited<ReturnType<typeof decode>>;
  try {
    decoded = await decode(file);
  } catch {
    const converted = await convertHeic(file).catch((e) => {
      console.error('[heic]', e);
      return null;
    });
    if (!converted) throw new UnsupportedImageError('Bildeformatet støttes ikke');
    decoded = await decode(converted);
  }
  const { img, release } = decoded;
  try {
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', quality),
    );
  } finally {
    release();
  }
}

/** Laster opp et bilde som allerede er gjort klart med prepareImage. */
/** Sender bildet (gjort klart med prepareImage) til serveren, som lagrer det i S3 eller lokalt. */
export async function uploadPhoto(taskId: number, blob: Blob): Promise<GameState> {
  let res: Response;
  try {
    res = await fetch(`/api/tasks/${taskId}/photo`, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
      credentials: 'same-origin',
    });
  } catch {
    throw new UploadError(0);
  }
  if (!res.ok) throw new UploadError(res.status, await errorCode(res));
  const json = (await res.json()) as { state: GameState };
  return json.state;
}

/** Statuskode og feilkode fra opplastingen, så feilmeldingen i appen kan si noe nyttig. */
export class UploadError extends Error {
  constructor(
    public status: number,
    public code?: string,
  ) {
    super(`opplasting ${status || 'nettverk'}${code ? ` ${code}` : ''}`);
  }
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
