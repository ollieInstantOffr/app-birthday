import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { isCorrect } from '@/lib/answers';
import { taskById } from '@/lib/content/public';
import { SECRETS } from '@/lib/content/secret';
import { prisma } from '@/lib/db';
import { buildState, loadContext, parseTaskId, statusOf, upsertProgress } from '@/lib/progress';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isPlayer())) return unauthorized();
  const id = parseTaskId((await params).id);
  if (!id || taskById(id)!.kind === 'photo') return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { value } = (await req.json().catch(() => ({}))) as { value?: string };
  if (typeof value !== 'string' || !value.trim()) return NextResponse.json({ error: 'empty' }, { status: 400 });

  const { progress, testMode, now } = await loadContext();
  const status = statusOf(id, progress, now, testMode);
  if (status === 'locked' || status === 'timelocked') return NextResponse.json({ error: status }, { status: 409 });

  if (status !== 'solved') {
    const secret = SECRETS[id];
    const correct = isCorrect(value, secret.accepted ?? [], secret.match);
    const row = progress.get(id)!;
    await prisma.attemptLog.create({ data: { taskId: id, value: value.slice(0, 200), correct } });
    await upsertProgress(id, {
      attemptCount: row.attemptCount + (correct ? 0 : 1),
      solvedAt: correct ? now : null,
      openedAt: row.openedAt ?? now,
    });
    if (!correct) return NextResponse.json({ correct: false, state: await buildState() });
  }
  return NextResponse.json({ correct: true, state: await buildState() });
}
