import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { loadContext, parseTaskId, statusOf, upsertProgress } from '@/lib/progress';

// Starter 5-minutters-klokka for hint første gang brevet åpnes.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const { progress, testMode, now } = await loadContext();
  if (statusOf(id, progress, now, testMode) === 'available' && !progress.get(id)!.openedAt) {
    await upsertProgress(id, { openedAt: now });
  }
  return NextResponse.json({ ok: true });
}
