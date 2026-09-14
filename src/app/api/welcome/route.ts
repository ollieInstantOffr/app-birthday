import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
  if (!(await isPlayer())) return unauthorized();
  const now = new Date();
  await prisma.appState.upsert({ where: { id: 1 }, create: { id: 1, welcomedAt: now }, update: { welcomedAt: now } });
  return NextResponse.json({ ok: true });
}
