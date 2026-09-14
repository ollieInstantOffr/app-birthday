import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type Role = 'player' | 'admin';

const COOKIE: Record<Role, string> = { player: 'bj_player', admin: 'bj_admin' };
const MAX_AGE: Record<Role, number> = { player: 72 * 3600, admin: 7 * 24 * 3600 };

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET mangler');
  return s || 'dev-secret';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function codeMatches(input: string, role: Role): boolean {
  const expected =
    role === 'player' ? process.env.ACCESS_CODE || '180994' : process.env.ADMIN_PASSWORD || process.env.ADMIN_CODE || '';
  if (!expected) return false;
  return safeEqual(input.replace(/\s/g, ''), expected);
}

export function setSession(res: NextResponse, role: Role) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE[role];
  const payload = `${role}.${exp}`;
  res.cookies.set(COOKIE[role], `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE[role],
  });
}

export function clearSession(res: NextResponse, role: Role) {
  res.cookies.set(COOKIE[role], '', { httpOnly: true, path: '/', maxAge: 0 });
}

async function hasRole(role: Role): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE[role])?.value;
  if (!raw) return false;
  const [r, exp, sig] = raw.split('.');
  if (r !== role || !exp || !sig) return false;
  if (!safeEqual(sig, sign(`${r}.${exp}`))) return false;
  return Number(exp) * 1000 > Date.now();
}

export const isPlayer = () => hasRole('player');
export const isAdmin = () => hasRole('admin');

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
