import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { taskById } from '@/lib/content/public';
import { prisma } from '@/lib/db';
import { buildState, loadContext, parseTaskId, statusOf, upsertProgress } from '@/lib/progress';
import { keyTask, readLocal, storageMode } from '@/lib/storage';

// Kalles etter at bildet er lastet opp. Opplasting = løst.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id || taskById(id)!.kind !== 'photo') return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (typeof key !== 'string' || keyTask(key) !== id) return NextResponse.json({ error: 'bad key' }, { status: 400 });

  const { progress, testMode, now } = await loadContext();
  const status = statusOf(id, progress, now, testMode);
  if (status === 'locked' || status === 'timelocked') return NextResponse.json({ error: status }, { status: 409 });

  const mode = storageMode();
  if (mode === 'local') {
    try {
      await readLocal(key);
    } catch {
      return NextResponse.json({ error: 'missing upload' }, { status: 400 });
    }
  }

  await prisma.submission.create({ data: { taskId: id, storage: mode, key } });
  if (status !== 'solved') await upsertProgress(id, { solvedAt: now, openedAt: progress.get(id)!.openedAt ?? now });
  return NextResponse.json({ ok: true, state: await buildState() });
}
