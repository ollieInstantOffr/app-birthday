import { NextResponse } from 'next/server';
import { isPlayer, unauthorized } from '@/lib/auth';
import { FINALE_PHOTO_TASKS, taskById } from '@/lib/content/public';
import { GIFT, SECRETS } from '@/lib/content/secret';
import { prisma } from '@/lib/db';
import { buildState } from '@/lib/progress';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isPlayer())) return unauthorized();
  const state = await buildState();
  // I testmodus kan finalen åpnes når som helst.
  if (!state.allSolved && !state.testMode) return NextResponse.json({ error: 'not yet' }, { status: 403 });

  const cards = FINALE_PHOTO_TASKS.map((id) => {
    const view = state.tasks.find((t) => t.id === id)!;
    return {
      taskId: id,
      caption: taskById(id)!.caption ?? '',
      message: SECRETS[id].message,
      photoUrl: view.solved?.photoUrl ?? null,
    };
  });
  return NextResponse.json({ cards, gift: GIFT, giftOpened: state.giftOpened });
}

// Registrerer at gaven er åpnet, så admin ser det. Testrunder teller ikke.
export async function POST() {
  if (!(await isPlayer())) return unauthorized();
  const state = await buildState();
  if (!state.allSolved && !state.testMode) return NextResponse.json({ error: 'not yet' }, { status: 403 });
  if (!state.testMode || state.allSolved) {
    const now = new Date();
    await prisma.appState.upsert({ where: { id: 1 }, create: { id: 1, giftOpenedAt: now }, update: { giftOpenedAt: now } });
  }
  return NextResponse.json({ ok: true });
}
