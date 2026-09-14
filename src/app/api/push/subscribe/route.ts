import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { saveDevice } from '@/lib/push';

export async function POST(req: Request) {
  if (!(await isPlayer())) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const ok = await saveDevice(body, req.headers.get('user-agent'));
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'ugyldig abonnement' }, { status: 400 });
}
