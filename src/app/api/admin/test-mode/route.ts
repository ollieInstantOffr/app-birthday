import { NextResponse } from 'next/server';
import { isAdmin, unauthorized } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Slår testmodus av/på: alle brev åpne, hint med en gang, finalen tilgjengelig.
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { enabled } = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  if (typeof enabled !== 'boolean') return NextResponse.json({ error: 'enabled må være true/false' }, { status: 400 });
  await prisma.appState.upsert({ where: { id: 1 }, create: { id: 1, testMode: enabled }, update: { testMode: enabled } });
  return NextResponse.json({ ok: true, testMode: enabled });
}
