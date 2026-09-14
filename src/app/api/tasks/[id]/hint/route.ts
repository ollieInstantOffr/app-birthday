import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { buildState, hintAvailability, loadContext, parseTaskId, upsertProgress } from '@/lib/progress';

// Åpner hint 1 (og hint 2 hvis den er tilgjengelig). Returnerer ny state.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { progress, testMode, now } = await loadContext();
  const row = progress.get(id)!;
  const h = hintAvailability(row, now, testMode);
  if (h.available1 && !row.hint1At) {
    await upsertProgress(id, { hint1At: now, attemptsAtHint1: row.attemptCount });
  } else if (h.available2 && !row.hint2At) {
    await upsertProgress(id, { hint2At: now });
  }
  return NextResponse.json({ state: await buildState() });
}
