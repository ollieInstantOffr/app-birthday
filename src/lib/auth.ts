import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './db';

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

/** Gjeldende versjon for Regines innlogginger. Full nullstilling i admin øker den og logger ut alle enheter. */
async function playerSessionVersion(): Promise<number> {
  const app = await prisma.appState.findUnique({ where: { id: 1 }, select: { sessionVersion: true } });
  return app?.sessionVersion ?? 1;
}

export async function setSession(res: NextResponse, role: Role) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE[role];
  const version = role === 'player' ? await playerSessionVersion() : 0;
  const payload = `${role}.${exp}.${version}`;
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
  const parts = raw.split('.');
  if (parts.length !== 4) return false;
  const [r, exp, version, sig] = parts;
  if (r !== role || !safeEqual(sig, sign(`${r}.${exp}.${version}`))) return false;
  if (Number(exp) * 1000 <= Date.now()) return false;
  if (role === 'player' && Number(version) !== (await playerSessionVersion())) return false;
  return true;
}

export const isPlayer = () => hasRole('player');
export const isAdmin = () => hasRole('admin');

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
